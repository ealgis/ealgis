import json

mapping = {"g59": "b46", "g57": "b45", "g53": "b44", "g51": "b43", "g43": "b42", "g47": "b41", "g46": "b40", "g42": "b39", "g41": "b38", "g40": "b37", "g38": "b36", "g37": "b35", "g36": "b34", "g34": "b33", "g33": "b32", "g32": "b31", "g31": "b30", "g30": "b29", "g29": "b28", "g27": "b27", "g28": "b26", "g25": "b25", "g24": "b24", "g23": "b23", "g22": "b22", "g21": "b21", "g20": "b20", "g19": "b19", "g18": "b18", "g17": "b17", "g16": "b16", "g15": "b15", "g14": "b14", "g13": "b13", "g12": "b12", "g11": "b11", "g10": "b10", "g09": "b09", "g08": "b08", "g07": "b07", "g06": "b06", "g05": "b05", "g04": "b04", "g03": "b03", "g02": "b02", "g01": "b01", "g56": "x42", "g55": "x41", "g54": "x40", "g58": "x39", "g52": "x38", "g50": "x37", "g49": "x36", "g48": "x35", "g44": "x34", "g45": "x33", "g26": "x32", "g38": "x31", "g38": "x30", "g38": "x29", "g39": "x28", "g39": "x27", "g39": "x26", "g39": "x25", "g34": "x24", "g36": "x23", "g29": "x22", "g29": "x21", "g29": "x20", "g29": "x19", "g29": "x18", "g29": "x17", "g29": "x16", "g29": "x15", "g29": "x14", "g35": "x13", "g28": "x12", "g28": "x11", "g28": "x10", "g28": "x09", "g14": "x08", "g26": "x07", "g08": "x06", "g13": "x05", "g11": "x04", "g10": "x03", "g09": "x02", "g09": "x01"}

new_mapping = {}
schema = "x"

with open("xcp_topic_mapping.json") as f:
    file = json.load(f)
    for topic, table_list in file.items():
        new_mapping[topic] = []
        for table in table_list:
            if table.lower() in mapping and mapping[table.lower()].startswith(schema):
                new_mapping[topic].append(mapping[table.lower()])

with open("xcp_topic_mapping.json", "w") as f:
    json.dump(new_mapping, f)
