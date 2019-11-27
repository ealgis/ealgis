import re
import wordninja


def multiple_replace(text, adict):
    rx = re.compile('|'.join(map(re.escape, adict)))

    def one_xlat(match):
        return adict[match.group(0)]
    return rx.sub(one_xlat, text)


def fixLackOfSpaces(table_number, column_name, metadata, seriesName):
    """
    The TSP datapack for 2016 had an issue with its column names. They were lacking spaces between words!
    So we have to turn "Employed:Workedfull-time|2016CENSUS-PERSONS" into "Employed Worked full time|2016CENSUS-PERSONS"
    """
    def getKindWithoutSeriesName(kind, seriesName):
        if seriesName is not None:
            return kind.split("|")[0]
        return kind

    def getTypeWithoutSeriesName(type, seriesName):
        if seriesName is not None:
            seriesName = seriesName.replace(":", "")
            return re.sub(seriesName, "", type, re.IGNORECASE).strip()
        return type

    # The TSP DataPack contains a pile of typos where words are run together without spaces *sigh*
    if table_number.startswith("t"):
        # No need to repair Total columns
        if metadata["kind"].startswith("Total|"):
            return metadata

        # No need to repair T34 and T35
        if metadata["kind"].startswith("2006 Census:") or metadata["kind"].startswith("2011 Census:") or metadata["kind"].startswith("2016 Census:"):
            return metadata

        kindWithoutSeries = getKindWithoutSeriesName(metadata["kind"], seriesName)

        # Wordninja doesn't handle currencies and number ranges well (they split as individual characters).
        # So we handle this by eplacing them with a special nonsense word "hotcakes" prior to running wordninja.

        # Just in case they use our special nonsense word was used in a column.
        if "hotcake" in kindWithoutSeries:
            raise Exception("Hotcakes!")

        kindWithoutSeriesAndSpecial = kindWithoutSeries

        match = re.search("(?P<currencyornumberrange>\$?[0-9]{1,}(-\$?[0-9]{1,})?)", kindWithoutSeries)
        if match is not None:
            kindWithoutSeriesAndSpecial = kindWithoutSeries.replace(match.group("currencyornumberrange"), "hotcake")

        newKindWithSpaces = " ".join(wordninja.split(kindWithoutSeriesAndSpecial.lower()))
        if match is not None:
            newKindWithSpaces = newKindWithSpaces.replace("hotcake", match.group("currencyornumberrange"))
        newKindWithSpaces = newKindWithSpaces.capitalize()
        metadata["kind"] = metadata["kind"].replace(kindWithoutSeries, newKindWithSpaces)

        if table_number == "t11":
            metadata["kind"] = metadata["kind"].replace("very well orwell", "very well or well")

        return metadata

    return metadata


def repair_column_series_census_metadata(table_number, column_name, column_heading):
    if column_heading is None:
        return column_heading

    column_number = int(column_name[1:])

    if table_number.startswith("t"):
        column_heading = multiple_replace(column_heading, {
            "2006CENSUS-MALES": "2006 Census: Males",
            "2006CENSUS-FEMALES": "2006 Census: Females",
            "2006CENSUS-PERSONS": "2006 Census: Persons",
            "2006CENSUS": "2006 Census",
            "2011CENSUS-MALES": "2011 Census: Males",
            "2011CENSUS-FEMALES": "2011 Census: Females",
            "2011CENSUS-PERSONS": "2011 Census: Persons",
            "2011CENSUS": "2011 Census",
            "2016CENSUS-MALES": "2016 Census: Males",
            "2016CENSUS-FEMALES": "2016 Census: Females",
            "2016CENSUS-PERSONS": "2016 Census: Persons",
            "2016CENSUS": "2016 Census",
        })

        if table_number == "t12":
            # These are mislabelled as part of the 2006 Census series
            if column_number >= 4949 and column_number <= 4968:
                column_heading = column_heading.replace("2006 Census", "2011 Census")
            # These are mislabelled as part of the 2011 Census series
            elif column_number >= 5259 and column_number <= 5278:
                column_heading = column_heading.replace("2011 Census", "2016 Census")
        elif table_number == "t18":
            column_number = int(column_name[1:])
            # Typoed as "itecture"
            if column_number == 7801:
                if column_heading != "2016 Census":
                    column_heading = "Other dwelling|2016 Census"
        elif table_number == "t20":
            # These are mislabelled as part of the 2006 Census series
            if column_number >= 8326 and column_number <= 8337:
                column_heading = column_heading.replace("2006 Census", "2011 Census")

    elif table_number == "w03":
        if column_number >= 463 and column_number <= 466:
            column_heading = column_heading.replace("EmployeeS", "Employee")
    elif table_number == "w19":
        column_heading = column_heading.replace(" STUDENTS", " STUDENT")

    elif table_number in ["i10", "i12"]:
        column_heading = column_heading.replace("HOUSEHOLDS WITH INDIGENOUS PERSON(S)", "Households with Aboriginal and or Torres Strait Islander Persons")

    return column_heading


def repair_census_metadata_first_pass(table_number, column_name, metadata):
    """
    Used to repair issues with column headings. Repeats some of what repair_column_series_census_metadata(), but it used in different parts of attrs.py.

    @FIXME For 2021 if we're still using this code.
    """
    column_number = int(column_name[1:])

    if table_number == "g38":
        if "None (includes bedsitters)" in metadata["kind"]:
            metadata["kind"] = metadata["kind"].replace("None (includes bedsitters)", "None but includes bedsitters")
    elif table_number == "g53":
        if metadata["kind"] == "Occupation inadequately described/ Not stated":
            metadata["kind"] = "Occupation inadequately described Not stated"
    elif table_number == "g57":
        if metadata["kind"] == "Occupation inadequately described/ Not stated":
            metadata["kind"] = "Occupation inadequately described Not stated"
    elif table_number == "i01":
        if "Non-Indigenous " in metadata["kind"]:
            metadata["kind"] = metadata["kind"].replace("Non-Indigenous ", "Non Indigenous: ")
        elif "Non-Indigenous:" in metadata["kind"]:
            metadata["kind"] = metadata["kind"].replace("Non-Indigenous", "Non Indigenous")
    elif table_number == "i02":
        column_number = int(column_name[1:])

        # Columns mistakenly include the row
        if column_number >= 514 and column_number <= 516:
            metadata["kind"] = metadata["kind"].replace("Indigenous: Total ", "")
        if column_number >= 517 and column_number <= 519:
            metadata["kind"] = metadata["kind"].replace("Non-Indigenous ", "")
        if column_number >= 520 and column_number <= 522:
            metadata["kind"] = metadata["kind"].replace("Indigenous status not stated: ", "")
        if column_number >= 523 and column_number <= 525:
            metadata["kind"] = metadata["kind"].replace("Total ", "")
    elif table_number == "i10":
        column_number = int(column_name[1:])

        if column_number >= 1624 and column_number <= 1944 and column_name[-1] == "4":
            metadata["kind"] = metadata["kind"].replace("Other dwelling: Caravan\ cabin\ houseboat|", "Other dwelling: Caravan|")
            metadata["kind"] = metadata["kind"].replace("Other dwelling: Cabin\ houseboat|", "Other dwelling: Caravan|")
        elif column_number >= 1645 and column_number <= 1945 and column_name[-1] == "5":
            metadata["kind"] = metadata["kind"].replace("Other dwelling: Caravan\ cabin\ houseboat|", "Other dwelling: Cabin\ houseboat|")

        metadata["kind"] = metadata["kind"].replace("Flat\ unit or apartment", "Flat unit or apartment")
    elif table_number == "t06":
        column_number = int(column_name[1:])
        if column_number >= 2326 and column_number <= 2328:
            metadata["kind"] = metadata["kind"].replace("Indigenous:", "Aboriginal and or Torres Strait Islander:")
    elif table_number == "t12":
        # These are mislabelled as part of the 2006 Census series
        if column_number >= 4949 and column_number <= 4968:
            metadata["kind"] = metadata["kind"].replace("2006CENSUS", "2011CENSUS")
        # These are mislabelled as part of the 2011 Census series
        elif column_number >= 5259 and column_number <= 5278:
            metadata["kind"] = metadata["kind"].replace("2011CENSUS", "2016CENSUS")
        # Mislablled as "Other religious affilation"
        elif column_number == 5549:
            metadata["type"] = "2016_Census_Religious_affiliation_not_stated_0_14_years"
    elif table_number == "t18":
        column_number = int(column_name[1:])
        # Typoed as "itecture"
        if column_number == 7801:
            metadata["kind"] = "Otherdwelling|2016CENSUS"
    elif table_number == "t20":
        # These are mislabelled as part of the 2006 Census series
        if column_number >= 8326 and column_number <= 8337:
            metadata["kind"] = metadata["kind"].replace("2006CENSUS", "2011CENSUS")

    elif table_number == "w03":
        column_number = int(column_name[1:])
        if column_number >= 463 and column_number <= 466:
            metadata["kind"] = metadata["kind"].replace("EmployeeS", "Employee")
    return metadata


def repair_census_metadata(table_number, column_name, metadata, seriesName):
    metadata["type"] = metadata["type"].strip().replace("_", " ").replace("-", " ")
    metadata["kind"] = repair_column_series_census_metadata(table_number, column_name, metadata["kind"])
    metadata = fixLackOfSpaces(table_number, column_name, metadata, seriesName)

    if table_number == "g03":
        if metadata["kind"] != "Total":
            metadata["kind"] = "Age {}".format(metadata["kind"])
    elif table_number == "g09":
        if metadata["type"] == "Males Afghanistan Age Total":
            metadata["type"] = "Males Afghanistan Total"
        elif metadata["type"] == "Females Afghanistan Age Total":
            metadata["type"] = "Females Afghanistan Total"
        elif metadata["type"] == "Persons Afghanistan Age Total":
            metadata["type"] = "Persons Afghanistan Total"
    elif table_number == "g10":
        # Remove "Year of arrival" prefix
        if "Year of arrival not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Year of arrival", "")
    elif table_number == "g11":
        metadata["kind"] = metadata["kind"].replace("2006 2015", "2006 2010")
        metadata["kind"] = metadata["kind"].replace("2006-2015", "2006-2010")
    elif table_number == "g16":
        if metadata["kind"].startswith("Total|") == False:
            metadata["kind"] = "Age {}".format(metadata["kind"])
    elif table_number == "g17":
        if metadata["kind"].startswith("Total|") == False:
            metadata["kind"] = "Age {}".format(metadata["kind"])
    elif table_number == "g18":
        if metadata["kind"].startswith("Need for assistance|") == True:
            metadata["kind"] = metadata["kind"].replace("Need for assistance", "Has need for assistance")
        if metadata["kind"].startswith("No need for assistance|") == True:
            metadata["kind"] = metadata["kind"].replace("No need for assistance", "Does not have need for assistance")
    elif table_number == "g23":
        if metadata["kind"].startswith("Aged 15-24 years|") == True:
            metadata["kind"] = metadata["kind"].replace("Aged", "Age")
        elif metadata["kind"].startswith("Total|") == False:
            metadata["kind"] = "Age {}".format(metadata["kind"])
    elif table_number == "g24":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One child",
            ": 2": " Two children",
            ": 3": " Three children",
            ": 4": " Four children",
            ": 5": " Five children",
            ": 6 or more": " Six or more children",
            ": None": " No children",
        })
    elif table_number == "g33":
        # Remove "Dwelling structure" prefix
        if "Dwelling structure not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Dwelling structure", "")
    elif table_number == "g34":
        # Remove "Dwelling structure" prefix
        if "Dwelling structure Not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Dwelling structure", "")
    elif table_number == "g36":
        # Remove "Landlord type" prefix
        if "Landlord type Not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Landlord type", "")
    elif table_number == "g37":
        # Remove "Dwelling structure" prefix
        if "Dwelling structure Not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Dwelling structure", "")
    elif table_number == "g38":
        metadata["kind"] = metadata["kind"].replace("Six bedrooms or more", "Six or more bedrooms")

        # Remove "Number of bedrooms" prefix
        if "Number of bedrooms Not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Number of bedrooms", "")

        if "None includes bedsitters" in metadata["type"]:
            metadata["type"] = metadata["type"].replace("None includes bedsitters", "None but includes bedsitters")
    elif table_number == "g43":
        if metadata["kind"].startswith("Total|") == False:
            metadata["kind"] = "Age {}".format(metadata["kind"])
    elif table_number == "g52":
        metadata["kind"] = metadata["kind"].replace("49 and over", "49 hours and over")
    elif table_number == "g53":
        if "Occupation Inadequately described Not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Occupation", "")
    elif table_number == "g54":
        if metadata["type"].startswith("400 599"):
            metadata["type"] = metadata["type"].replace("400 599", "400 499")
    elif table_number == "g56":
        metadata["kind"] = metadata["kind"].replace("Unemployed, looking for work: ", "Unemployed looking for ")
    elif table_number == "g57":
        if "Occupation Inadequately described Not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Occupation", "")
    elif table_number == "g58":
        metadata["kind"] = metadata["kind"].replace("49 and over", "49 hours and over")

    elif table_number == "p10":
        metadata["kind"] = metadata["kind"].replace("1966-1965", "1956-1965")
        metadata["kind"] = metadata["kind"].replace("Year of arrival: Year of arrival not stated", "Year of arrival not stated")
        metadata["type"] = metadata["type"].replace("Iran  Herzegovina", "Iran")
    elif table_number == "p18":
        metadata["kind"] = metadata["kind"].replace("Overseas vistors", "Overseas visitors")
    elif table_number == "p19":
        metadata["kind"] = metadata["kind"].replace("Overseas vistors", "Overseas visitors")
    elif table_number == "p20":
        # Remove duplicate prefix
        if column_name == "p4001":
            metadata["kind"] = metadata["kind"].replace("Unpaid domestic work: number of hours: Unpaid domestic work: number of hours:", "Unpaid domestic work: number of hours:")
    elif table_number == "p21":
        # Remove duplicate prefix
        if column_name == "p4229":
            metadata["kind"] = metadata["kind"].replace("Unpaid assistance to a person with a disability: Unpaid assistance to a person with a disability:", "Unpaid assistance to a person with a disability:")
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

    elif table_number == "t06":
        column_number = int(column_name[1:])
        if column_number >= 2326 and column_number <= 2328:
            metadata["type"] = metadata["type"].replace("over Indigenous", "over Aboriginal and or Torres Strait Islander")

    elif table_number == "t07":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "1|": "One child|",
            "2|": "Two|",
            "3|": "Three|",
            "4|": "Four|",
            "5|": "Five|",
            "6 or more|": "Six or more|",
            "none|": "No children|",
        })
    elif table_number == "t15":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "1|": "One|",
            "2|": "Two|",
            "3|": "Three|",
            "4|": "Four|",
            "5|": "Five|",
            "6 or more|": "Six or more|",
        })
    elif table_number == "t16":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "1|": "One|",
            "2|": "Two|",
            "3|": "Three|",
            "4|": "Four|",
            "5|": "Five|",
            "6 or more|": "Six or more|",
        })
        metadata["kind"] = metadata["kind"].replace("usually resident", "usually resident in family households")
    elif table_number == "t17":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "1|": "One|",
            "2|": "Two|",
            "3|": "Three|",
            "4|": "Four|",
            "5|": "Five|",
            "6 or more|": "Six or more|",
        })
        metadata["kind"] = metadata["kind"].replace("usually resident", "usually resident in group households")
    elif table_number == "t18":
        # Remove "Dwelling structure" prefix
        if "Dwelling structure Not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Dwelling structure ", "")
    elif table_number == "t19":
        column_number = int(column_name[1:])
        if column_number in [7912, 8024, 8136]:
            metadata["type"] = metadata["type"].replace("850 and 950", "850 and 949")

        # Remove "Landlord type" prefix
        if "Landlord type Not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Landlord type", "")
    elif table_number == "t22" or table_number == "t23":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "1 child|": "One child|",
            "2 children|": "Two children|",
            "3 children|": "Three children|",
            "4 or more children|": "Four or more children|",
        })
    elif table_number == "t24":
        column_number = int(column_name[1:])
        if column_number == 9686:
            metadata["type"] = metadata["type"].replace("150 149", "150 199")
        elif column_number == 9700:
            metadata["type"] = metadata["type"].replace("150 224", "200 224")
    elif table_number == "t27":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            "1|": "One|",
            "2|": "Two|",
            "3|": "Three|",
            "4 or more|": "Four or more|",
        })
    elif table_number == "t28":
        metadata["type"] = metadata["type"].replace("Has need assistance", "Has need for assistance")

    elif table_number == "w02" or table_number == "w04":
        # Not altering series name - this the column label
        metadata["kind"] = metadata["kind"].replace("Employees", "Employee")
    elif table_number == "w05":
        # Not altering series name - this the column label
        metadata["kind"] = metadata["kind"].replace("Employees", "Employee")

        metadata["type"] = metadata["type"].replace("United Kingdom Channel Islands and Isle of Man Channel Islands and Isle of Man", "United Kingdom Channel Islands and Isle of Man")
    elif table_number == "w06":
        # Not altering series name - this the column label
        metadata["kind"] = metadata["kind"].replace("Employees", "Employee")

        column_number = int(column_name[1:])
        if column_number == 2754:
            # Mislabelled as from the "200 - 299" range
            metadata["type"] = "Persons 150 299 Total"
    elif table_number == "w12":
        metadata["kind"] = metadata["kind"].replace("Occupation inadequately", "inadequately")
    elif table_number == "w19":
        metadata["kind"] = metadata["kind"].replace(" STUDENTS", " STUDENT")
    elif table_number == "w23":
        metadata["kind"] = metadata["kind"].replace("Institutions:", "Institution:")

    elif table_number == "i01":
        column_number = int(column_name[1:])

        if column_number == 3:
            metadata["kind"] = metadata["kind"].replace("Islander Persons:", "Islander: Persons")
        elif column_number >= 10 and column_number <= 12:
            metadata["kind"] = metadata["kind"].replace("Total ", "Total: ")
        elif column_number >= 52 and column_number <= 54:
            metadata["type"] = metadata["type"].replace("Non Aboriginal and or Torres Strait Islander", "Non Indigenous")
        elif column_number == 241:
            metadata["type"] += " Males"
    elif table_number == "i06":
        if "Non-Indigenous" not in metadata["kind"] and "Indigenous status not stated" not in metadata["kind"]:
            metadata["kind"] = metadata["kind"].replace("Indigenous", "Aboriginal and or Torres Strait Islander")
    elif table_number == "i08":
        metadata["kind"] = metadata["kind"].replace("Need for assistance|", "Has need for assistance|")
        metadata["kind"] = metadata["kind"].replace("No need for assistance|", "Does not have need for assistance|")
    elif table_number == "i10":
        column_number = int(column_name[1:])

        metadata["type"] = metadata["type"].replace("Dwelling structure Flat or apartment", "Dwelling structure Flat unit or apartment")

        # Remove "Dwelling structure" prefix
        if "Dwelling structure Not stated" not in metadata["type"]:
            metadata["type"] = metadata["type"].replace("Dwelling structure", "")
    elif table_number == "i11":
        metadata["kind"] = metadata["kind"].replace("Indigenous households", "Households with Aboriginal and or Torres Strait Islander Persons")
    elif table_number == "i12":
        metadata["kind"] = multiple_replace(metadata["kind"], {
            ": 1": " One",
            ": 2": " Two",
            ": 3": " Three",
            ": 4": " Four",
            ": 5": " Five",
            ": 6 or more": " Six or more",
        })
    elif table_number == "i13":
        metadata["kind"] = metadata["kind"].replace("Households with Indigenous person(s)", "Households with Aboriginal and or Torres Strait Islander Persons")
    elif table_number == "i15":
        column_number = int(column_name[1:])

        # Column heading mislabelled as "Certificate Level nfd|FEMALES"
        if column_number == 2688:
            metadata["kind"] = "Level of education not stated|FEMALES"
        if column_number == 2893:
            metadata["type"] = metadata["type"].replace("Certificatel", "Certificate")

    return metadata
