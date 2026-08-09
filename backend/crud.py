import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import text, select, insert, func, cast, Date, literal_column

from models import TelemetryData
from metric_data import metrics

def get_followed_metrics(db: Session) -> list[str]:

    query = text("SELECT MEASUREMENT_TYPE FROM dbo.FOLLOWED_METRICS")
    results = db.execute(query).fetchall()

    return [row._mapping.get("MEASUREMENT_TYPE") for row in results]

def get_node_names(db: Session) -> list[str]:
    query = text("SELECT DISTINCT NODE_NAME FROM dbo.ONAP_DATA")
    results = db.execute(query).fetchall()

    return [row._mapping.get("NODE_NAME") for row in results]

def save_batch(db:Session, batch) -> None:

    db.execute(insert(TelemetryData), batch)
    db.commit()
    
    batch.clear()

def build_time_bucket_sql_expr(bucket_size: str):

    if bucket_size == '1d':
        return cast(TelemetryData.begin_time, Date).label('bucket_time')

    if bucket_size== '1h':
        return func.dateadd(
            literal_column('hour'),
            func.datediff(literal_column('hour'), literal_column('0'), TelemetryData.begin_time),
            literal_column('0')
        ).label('bucket_time')

    return TelemetryData.begin_time.label('bucket_time')

def build_telemetry_query(db: Session, node_name: str, metric_components: list[str], bucket_size: str, start_time, end_time):

    bucket_expr = build_time_bucket_sql_expr(bucket_size)

    query = (
        select(
            bucket_expr,
            TelemetryData.measurement_type,
            func.sum(TelemetryData.measurement_value).label('sum_val'),
            func.avg(TelemetryData.measurement_value).label('avg_val'),
            func.max(TelemetryData.measurement_value).label('max_val'),
            func.sum(TelemetryData.granularity).label('granularity')
        )
        .where(
            TelemetryData.node_name == node_name,
            TelemetryData.begin_time >= start_time,
            TelemetryData.begin_time <= end_time,
            TelemetryData.measurement_type.in_(metric_components)
        )
        .group_by(
            bucket_expr,
            TelemetryData.measurement_type
        )
        .order_by(
            bucket_expr
        )
    )

    return query

def procces_query(db:Session, metric_data: dict[str: str], query):

    sql_results = db.execute(query).mappings().all()

    if not sql_results:
        return {
            "message": "No data found!"
        }

    dataframe = pd.DataFrame(sql_results)
    print("Indicatori unici adusi din SQL:", dataframe['measurement_type'].unique())

    metric_formula = metric_data.get('Formula')
    metric_aggregation = metric_data.get('Aggregation')

    if metric_aggregation == "SUM":
        value_column = 'sum_val'
    elif metric_aggregation == "AVG":
        value_column = 'avg_val'
    else:
        value_column = 'max_val'

    print(dataframe.columns)

    dataframe_pivot = dataframe.pivot(index='bucket_time', columns='measurement_type', values=value_column)

    dataframe_granularity = dataframe.groupby('bucket_time')['granularity'].first()
    dataframe_final = dataframe_pivot.join(dataframe_granularity)
    dataframe_final.columns = dataframe_final.columns.str.replace('.', '_').fillna(0)
    print(dataframe_final.columns)    
    print(dataframe_final.head(3))

    results = dataframe_final.eval(metric_formula)
    results = results.replace([np.inf, -np.inf, np.nan], 0)

    return results

def calculate(db: Session, node_name: str, metric: str, bucket_size: str, start_time, end_time):

    metric_data = metrics.get(metric)

    query = build_telemetry_query(db, node_name, metric_data.get('Components'), bucket_size, start_time, end_time)

    results = procces_query(db, metric_data, query)

    results.name = metric
    results_export = results.reset_index()

    results_export['bucket_time'] = results_export['bucket_time'].astype(str)

    return results_export.to_dict(orient='records')