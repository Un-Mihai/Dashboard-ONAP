def auto_scale(value: float, unit: str) -> tuple[float, str]:
    transitions = {
        "Kb": (8192, "MB", 8192),
        "MB": (1024, "GB", 1024),
        "GB": (1024, "TB", 1024),
        
        "Kb/s": (8192, "MB/s", 8192), 
        "MB/s": (1024, "GB/s", 1024),
        "GB/s": (1024, "TB/s", 1024),
        
        "W": (1000, "kW", 1000),
        "kW": (1000, "MW", 1000),
        "MW": (1000, "GW", 1000)
    }

    while unit in transitions:
        threshold, next_unit, divisor = transitions[unit]
        
        if value >= threshold:
            value /= divisor
            unit = next_unit
        else:
            break
            
    return round(value, 2), unit

def adapt_units(data: dict) -> dict:
    for metric_name, content in data.items():
        if metric_name == "gNB": 
            continue

        if isinstance(content, dict) and "units" in content and "value" in content:
            new_val, new_unit = auto_scale(content["value"], content["units"])
            content["value"] = new_val
            content["units"] = new_unit

        elif isinstance(content, list):
            for item in content:
                unit_key = "Units" if "Units" in item else "units"
                if unit_key in item and metric_name in item:
                    new_val, new_unit = auto_scale(item[metric_name], item[unit_key])
                    item[metric_name] = new_val
                    item[unit_key] = new_unit
                    
    return data