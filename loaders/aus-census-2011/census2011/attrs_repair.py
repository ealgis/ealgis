import re


def multiple_replace(text, adict):
    rx = re.compile('|'.join(map(re.escape, adict)))

    def one_xlat(match):
        return adict[match.group(0)]
    return rx.sub(one_xlat, text)


def repair_column_series_census_metadata(table_number, column_name, column_heading):
    if table_number == "p16":
        column_number = int(column_name[1:])
        # These are mislabelled as part of the FEMALES series
        if column_number >= 2994 and column_number <= 3003:
            column_heading = column_heading.replace("|FEMALES", "|MALES")
        # These are mislabelled as part of the PERSONS series
        elif column_number >= 3074 and column_number <= 3083:
            column_heading = column_heading.replace("|PERSONS", "|FEMALES")
    elif table_number == "t18":
        if column_name == "t7780":
            column_heading = "Other dwelling|2011 CENSUS"
    return column_heading


def repair_census_metadata(table_number, column_name, metadata):
    if table_number == "b03":
        if metadata["kind"] != "Total":
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "b09":
        column_number = int(column_name[1:])
        # These are mislabelled as "Person" - actually part of the PERSONS column
        if column_number == 1273:
            metadata["type"] += "s"
            metadata["kind"] = "Persons"
        # These are mislabelled as "Total" - actually part of the PERSONS column
        elif column_number == 1300:
            metadata["type"] = "Japan_Persons"
            metadata["kind"] = "Persons"
    elif table_number == "b10":
        if not (metadata["kind"] == "Total" or metadata["kind"] == "Year of arrival not stated"):
            metadata["kind"] = "Year of arrival %s" % (metadata["kind"])
    elif table_number == "b11":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Year of arrival not stated")):
            metadata["kind"] = "Year of arrival %s" % (metadata["kind"])
    elif table_number == "b16":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "b17":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "b18":
        metadata["kind"] = metadata["kind"].replace("No need for assistance", "Does not have need for assistance")
        if metadata["kind"].startswith("Need for assistance|"):
            metadata["kind"] = "Has %s" % (metadata["kind"])
    elif table_number == "b23":
        if column_name == "b4599":
            metadata["kind"] = "15-24 years|PERSONS"
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "b24":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One child",
            ": 2": " Two children",
            ": 3": " Three children",
            ": 4": " Four children",
            ": 5": " Five children",
            ": 6 or more": " Six or more children",
            ": None": " No children",
        })
    elif table_number == "b32":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Dwelling structure not stated")):
            metadata["kind"] = "Dwelling structure %s" % (metadata["kind"])
    elif table_number == "b33":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Dwelling structure not stated")):
            metadata["kind"] = "Dwelling structure %s" % (metadata["kind"])
    elif table_number == "b34":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Landlord type not stated")):
            metadata["kind"] = "Landlord type %s" % (metadata["kind"])
    elif table_number == "b35":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Dwelling structure not stated")):
            metadata["kind"] = "Dwelling structure %s" % (metadata["kind"])
    elif table_number == "b36":
        metadata["kind"] = metadata["kind"].replace("Six bedrooms or more", "Six or more bedrooms")

        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Number of bedrooms not stated")):
            metadata["kind"] = "Number of bedrooms %s" % (metadata["kind"])
    elif table_number == "b40":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "b41":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "b42":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "b43":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "b44":
        if not (metadata["kind"] == "Total" or metadata["kind"] == "Occupation inadequately described/ Not stated"):
            metadata["kind"] = "Occupation %s" % (metadata["kind"])
    elif table_number == "b45":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Occupation inadequately described/ Not stated")):
            metadata["kind"] = "Occupation %s" % (metadata["kind"])
    elif table_number == "i01":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "Total ": "Total: ",
            "Non-Indigenous ": "Non-Indigenous: ",
            "Indigenous Males": "Indigenous: Males",
            "Indigenous Females": "Indigenous: Females",
            "Indigenous Persons": "Indigenous: Persons",
        })
    elif table_number == "i02":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "Indigenous: Total ": "",
            "Non-Indigenous ": "",
            "Indigenous status not stated: ": "",
            "Total ": "",
        })
    elif table_number == "i08":
        metadata["kind"] = metadata["kind"].replace("No need for assistance", "Does not have need for assistance")
        if metadata["kind"].startswith("Need for assistance|"):
            metadata["kind"] = "Has %s" % (metadata["kind"])
    elif table_number == "i10":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Dwelling structure not stated")):
            metadata["kind"] = "Dwelling structure %s" % (metadata["kind"])
        if "Dwelling_structure_Total" in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Dwelling_structure_Total", "Total")
    elif table_number == "i11":
        metadata["kind"] = metadata["kind"].replace("Indigenous households", "Households with Indigenous persons")
    elif table_number == "i12":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One",
            ": 2": " Two",
            ": 3": " Three",
            ": 4": " Four",
            ": 5": " Five",
            ": 6 or more": " Six or more",
        })
    elif table_number == "i15":
        metadata["type"] = metadata["type"].replace("Certificatel", "Certificate")
    elif table_number == "p03":
        if metadata["kind"] != "Total":
            metadata["kind"] = "Age {}".format(metadata["kind"])
    elif table_number == "p10":
        if not (column_name == "p1966" or column_name == "p1967"):
            if not (metadata["kind"] == "Total" or metadata["kind"] == "Year of arrival not stated"):
                metadata["kind"] = "Year of arrival %s" % (metadata["kind"])
    elif table_number == "p11":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Year of arrival not stated")):
            metadata["kind"] = "Year of arrival %s" % (metadata["kind"])
    elif table_number == "p16":
        column_number = int(column_name[1:])
        # These are mislabelled as part of the FEMALES series
        if column_number >= 2994 and column_number <= 3003:
            metadata["kind"] = metadata["kind"].replace("|FEMALES", "|MALES")
        # These are mislabelled as part of the PERSONS series
        elif column_number >= 3074 and column_number <= 3083:
            metadata["kind"] = metadata["kind"].replace("|PERSONS", "|FEMALES")

        if not metadata["kind"].startswith("Total"):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "p17":
        if not metadata["kind"].startswith("Total"):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "p18":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "vistors": "visitors",
            "Need for assistance not stated": "Core activity need for assistance not stated",
            "Does not have need for assistance": "Core activity need for assistance Does not have need for assistance",
            "Has need for assistance": "Core activity need for assistance Has need for assistance",
        })
    elif table_number == "p19":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "vistors": "visitors",
            "Volunteer": "Voluntary work for an organisation or group Volunteer",
            "Not a volunteer": "Voluntary work for an organisation or group Not a volunteer",
            "Voluntary work not stated": "Voluntary work for an organisation or group Not stated",
        })
    elif table_number == "p20":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "Unpaid domestic work not stated": "Unpaid domestic work number of hours Not stated",
            "Did unpaid domestic work: ": "Unpaid domestic work number of hours ",
            "Did no unpaid domestic work": "Unpaid domestic work number of hours Did no unpaid domestic work",
        })
    elif table_number == "p21":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "Unpaid assistance not stated": "Unpaid assistance to a person with a disability Not stated",
            "Provided unpaid assistance": "Unpaid assistance to a person with a disability Provided unpaid assistance",
            "No unpaid assistance provided": "Unpaid assistance to a person with a disability No unpaid assistance provided",
        })
    elif table_number == "p22":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "Cared for: Own child/children only": "Unpaid child care Cared for own child children",
            "Cared for: Other child/children only": "Unpaid child care Cared for other child children",
            "Cared for: Total": "Unpaid child care Cared for child children Total",
            "Cared for: Own child/children and other child/children": "Unpaid child care Cared for: Own child/children and other child/children",
            "Did not provide child care": "Unpaid child care Did not provide child care",
        })
    elif table_number == "p23":
        if not metadata["kind"].startswith("Total"):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "p24":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One child",
            ": 2": " Two children",
            ": 3": " Three children",
            ": 4": " Four children",
            ": 5": " Five children",
            ": 6 or more": " Six or more children",
            ": None": " No children",
        })
    elif table_number == "p32":
        if not (metadata["kind"] == "Total" or metadata["kind"] == "Dwelling structure not stated"):
            metadata["kind"] = "Dwelling structure %s" % (metadata["kind"])
    elif table_number == "p33":
        if not (metadata["kind"] == "Total" or metadata["kind"] == "Dwelling structure not stated"):
            metadata["kind"] = "Dwelling structure %s" % (metadata["kind"])
    elif table_number == "p34":
        if not (metadata["kind"] == "Total" or metadata["kind"] == "Landlord type not stated"):
            metadata["kind"] = "Landlord type %s" % (metadata["kind"])
    elif table_number == "p35":
        if not (metadata["kind"] == "Total" or metadata["kind"] == "Dwelling structure not stated"):
            metadata["kind"] = "Dwelling structure %s" % (metadata["kind"])
    elif table_number == "p36":
        if not (metadata["kind"] == "Total"):
            metadata["kind"] = "Number of bedrooms %s" % (metadata["kind"])
    elif table_number == "p39":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "p40":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "p41":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Age %s" % (metadata["kind"])
    elif table_number == "p42":
        if not (metadata["kind"] == "Total"):
            metadata["kind"] = "Occupation %s" % (metadata["kind"])
    elif table_number == "p43":
        if not (metadata["kind"].startswith("Total")):
            metadata["kind"] = "Occupation %s" % (metadata["kind"])
    elif table_number == "x07":
        metadata["kind"] = metadata["kind"].replace("BIRTHPLACE OF PARENT/S NOT STATED", "Birthplace of parents not stated")
    elif table_number == "x17":
        metadata["kind"] = metadata["kind"].replace("Landlord type: Landlord type not stated", "Landlord type not stated")
    elif table_number == "x18":
        metadata["kind"] = metadata["kind"].replace("Landlord type: Landlord type not stated", "Landlord type not stated")
    elif table_number == "x24":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "etc:": "etc with",
            "Dwelling structure: Dwelling structure not stated": "Dwelling structure: not stated",
        })
        if column_name == "x11568":
            metadata["type"] = metadata["type"].replace("Dwelling_structure_Dwelling_structure_not_stated", "Dwelling_structure_not_stated")
    elif table_number == "x38":
        metadata["kind"] = metadata["kind"].replace("49 and over", "49 hours and over")
    elif table_number == "x39":
        metadata["kind"] = metadata["kind"].replace("49 and over", "49 hours and over")
    elif table_number == "x42":
        metadata["kind"] = metadata["kind"].replace("Unemployed, looking for work: ", "Unemployed looking for ")
    elif table_number == "t07":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One child",
            ": 2": " Two children",
            ": 3": " Three children",
            ": 4": " Four children",
            ": 5": " Five children",
            ": 6 or more": " Six or more children",
            ": None": " No children",
        })
    elif table_number == "t15":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One",
            ": 2": " Two",
            ": 3": " Three",
            ": 4": " Four",
            ": 5": " Five",
            ": 6 or more": " Six or more",
        })
    elif table_number == "t16":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One",
            ": 2": " in family households Two",
            ": 3": " in family households Three",
            ": 4": " in family households Four",
            ": 5": " in family households Five",
            ": 6 or more": " in family households Six or more",
        })
    elif table_number == "t17":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One",
            ": 2": " in group households Two",
            ": 3": " in group households Three",
            ": 4": " in group households Four",
            ": 5": " in group households Five",
            ": 6 or more": " in group households Six or more",
        })
    elif table_number == "t18":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Dwelling structure not stated")):
            metadata["kind"] = "Dwelling structure %s" % (metadata["kind"])

        if column_name == "t7780":
            metadata["kind"] = "Dwelling structure Other dwelling|2011 CENSUS"
    elif table_number == "t19":
        if not (metadata["kind"].startswith("Total") or metadata["kind"].startswith("Landlord type not stated")):
            metadata["kind"] = "Landlord type %s" % (metadata["kind"])
    elif table_number == "t22":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One",
            ": 2": " Two",
            ": 3": " Three",
            ": 4 or more": " Four or more",
        })
    elif table_number == "t23":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One",
            ": 2": " Two",
            ": 3": " Three",
            ": 4 or more": " Four or more",
        })
    elif table_number == "t25":
        metadata["type"] = multiple_replace(metadata["type"], {
            "_0_299": "_1_299",
        })
    elif table_number == "t27":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One",
            ": 2": " Two",
            ": 3": " Three",
            ": 4 or more": " Four or more",
        })
    elif table_number == "w12":
        metadata["kind"] = metadata["kind"].replace("Occupation inadequately", "inadequately")
    elif table_number == "w19":
        metadata["kind"] = metadata["kind"].replace(" STUDENTS", " STUDENT")
    elif table_number == "w23":
        metadata["kind"] = metadata["kind"].replace("Institutions:", "Institution:")
    return metadata
