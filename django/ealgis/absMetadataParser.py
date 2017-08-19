import re
import json

# Test data ONLY
tableMetadata = {
    # Mortgage Repayment (monthly) by Family Composition (X13)
    # https://localhost:8443/api/0.1/columninfo/by_table_kind_and_type/?format=json&kind=Families+in+occupied+private+dwellings+being+purchased&profileTablePrefix=x13&schema=aus_census_2011&tablePopulationName=&type=Mortgage+Repayment+%28monthly%29+by+Family+Composition
    "x13": {
        "rows": ["$1–$149", "$150–$299", "$300–$449", "$450–$599", "$600–$799", "$800–$999", "$1,000–$1,199", "$1,200–$1,399", "$1,400–$1,599", "$1,600–$1,799", "$1,800–$1,999", "$2,000–$2,199", "$2,200–$2,399", "$2,400–$2,599", "$2,600–$2,999", "$3,000–$3,999", "$4,000–$4,999", "$5,000 and over", "Mortgage repayment not stated", "Total"],
        "seriesName": None,
        "secondaryConceptName": None,  # Was in the table name, but not the columns
        "secondaryConceptNamePrefixes": ["Couple family with", "One parent family with"],
    },
    # Mortgage Repayment (monthly) by Dwelling Structure (X24)
    # https://localhost:8443/api/0.1/columninfo/by_table_kind_and_type/?schema=aus_census_2011&kind=Occupied%20private%20dwellings%20being%20purchased&type=Mortgage%20Repayment%20%28monthly%29%20by%20Dwelling%20Structure&tablePopulationName=&profileTablePrefix=x24
    "x24": {
        "rows": ["$0-$149", "$150-$299", "$300-$449", "$450-$599", "$600-$799", "$800-$999", "$1,000-$1,199", "$1,200-$1,399", "$1,400-$1,599", "$1,600-$1,799", "$1,800-$1,999", "$2,000-$2,199", "$2,200-$2,399", "$2,400-$2,599", "$2,600-$2,999", "$3,000-$3,999", "$4,000-$4,999", "$5,000 and over", "Mortgage repayment not stated", "Total"],
        "seriesName": None,
        "secondaryConceptName": "Dwelling structure",
        "secondaryConceptNamePrefixes": ["Flat\\ unit or apartment", "Semi-detached\\ row or terrace house\\"],
    },
    # Family Composition by Mortgage Repayment (T25)
    # https://localhost:8443/api/0.1/columninfo/by_table_kind_and_type/?schema=aus_census_2011&kind=Families%20in%20family%20households&type=Family%20Composition%20by%20Mortgage%20Repayment&tablePopulationName=2001%20CENSUS&profileTablePrefix=t25
    "t25": {
        "rows": ["Couple family with no children", "Couple family with children under 15 and dependent students", "Couple family with children under 15 and no dependent students", "Couple family with no children under 15 and with dependent students", "Couple family with non-dependent children only", "One parent family with children under 15 and dependent students", "One parent family with children under 15 and no dependent students", "One parent family with no children under 15 and with dependent students", "One parent family with non-dependent children only", "One parent families Total", "Total"],
        "seriesName": "2001 Census",
        "secondaryConceptName": "Mortgage repayment",
    },
    # Industry of Employment By Hours Worked by Sex (W11)
    # https://localhost:8443/api/0.1/columninfo/by_table_kind_and_type/?format=json&kind=Count+of+employed+persons+aged+15+years+and+over&profileTablePrefix=w11&schema=aus_census_2011&tablePopulationName=FEMALES&type=Industry+of+Employment+by+Hours+Worked+by+Sex
    "w11": {
        "rows": ["Agriculture, forestry and fishing", "Mining", "Manufacturing", "Electricity, gas, water and waste services", "Construction", "Wholesale trade", "Retail trade", "Accommodation and food services", "Transport, postal and warehousing", "Information media and telecommunications", "Financial and insurance services", "Rental, hiring and real estate services", "Professional, scientific and technical services", "Administrative and support services", "Public administration and safety", "Education and training", "Health care and social assistance", "Arts and recreation services", "Other services", "Inadequately described/Not stated", "Total"],
        "seriesName": "Females",
        "secondaryConceptName": "Number of hours worked",  # Differed from the table name!
    },
    # Non-School Qualification: Level of Education by Industry of Employment by Sex (X37)
    # https://localhost:8443/api/0.1/columninfo/by_table_kind_and_type/?schema=aus_census_2011&kind=Employed%20persons%20aged%2015%20years%20and%20over%20with%20a%20qualification&type=Non-School%20Qualification%3A%20Level%20of%20Education%20by%20Industry%20of%20Employment%20by%20Sex&tablePopulationName=PERSONS&profileTablePrefix=x37
    "x37": {
        "rows": ["Agriculture, forestry and fishing", "Mining", "Manufacturing", "Electricity, gas, water and waste services", "Construction", "Wholesale trade", "Retail trade", "Accommodation and food services", "Transport, postal and warehousing", "Information media and telecommunications", "Financial and insurance services", "Rental, hiring and real estate services", "Professional, scientific and technical services", "Administrative and support services", "Public administration and safety", "Education and training", "Health care and social assistance", "Arts and recreation services", "Other services", "Inadequately described/Not stated", "Total"],
        "seriesName": "Persons",
        "secondaryConceptName": None,  # Was in the table name, but not the columns
    },
    # Employment Type by Labour Force Status by Age by Sex (W04)
    # https://localhost:8443/api/0.1/columninfo/by_table_kind_and_type/?format=json&kind=Count+of+employed+persons+aged+15+years+and+over&profileTablePrefix=w04&schema=aus_census_2011&tablePopulationName=MALES&type=Employment+Type+by+Labour+Force+Status+by+Age+by+Sex
    "w04": {
        "rows": ["Employed, worked full-time 15-19 years", "Employed, worked full-time 20-24 years", "Employed, worked full-time 25-29 years", "Employed, worked full-time 30-34 years", "Employed, worked full-time 35-39 years", "Employed, worked full-time 40-44 years", "Employed, worked full-time 45-49 years", "Employed, worked full-time 50-54 years", "Employed, worked full-time 55-59 years", "Employed, worked full-time 60-64 years", "Employed, worked full-time 65-69 years", "Employed, worked full-time 70-74 years", "Employed, worked full-time 75 years and over", "Employed, worked full-time Total", "Employed, worked part-time 15-19 years", "Employed, worked part-time 20-24 years", "Employed, worked part-time 25-29 years", "Employed, worked part-time 30-34 years", "Employed, worked part-time 35-39 years", "Employed, worked part-time 40-44 years", "Employed, worked part-time 45-49 years", "Employed, worked part-time 50-54 years", "Employed, worked part-time 55-59 years", "Employed, worked part-time 60-64 years", "Employed, worked part-time 65-69 years", "Employed, worked part-time 70-74 years", "Employed, worked part-time 75 years and over", "Employed, worked part-time Total", "Employed, away from work", "Hours worked not stated", "Total"],
        "rowPrefixes": ["Employed worked part-time", "Employed worked full-time"],
        "seriesName": "Males",
        "secondaryConceptName": None,  # Was in the table name, but not the columns
        "secondaryConceptNamePrefixes": ["Owner managers of"],
    },
    # Proficiency in Spoken English/Language of Parents by Age of Dependent Children (P12)
    # https://localhost:8443/api/0.1/columninfo/by_table_kind_and_type/?format=json&kind=Dependent+children+in+couple+families&profileTablePrefix=p12&schema=aus_census_2011&tablePopulationName=DEPENDENT+CHILDREN+AGED+15-17+YEARS&type=Proficiency+in+Spoken+English%2FLanguage+of+Parents+by+Age+of+Dependent+Children
    "p12": {
        "rows": ["FEMALE PARENT Speaks English only", "FEMALE PARENT Speaks other language and speaks English Very well or well", "FEMALE PARENT Speaks other language and speaks English Not well or not at all", "FEMALE PARENT Speaks other language and speaks English Proficiency in English not stated", "FEMALE PARENT Speaks other language and speaks English Total", "FEMALE PARENT Language and proficiency in English not stated", "FEMALE PARENT Total"],
        "rowPrefixes": ["Speaks other language and speaks English"],
        "seriesName": "Dependent children aged 15-17 years",
        "secondaryConceptName": None,
        "secondaryConceptNamePrefixes": ["Male parent Speaks other language and speaks English"],
    },
    # Selected Person Characteristics by Indigenous Status by Sex (I01)
    # @TODO Will be a problem, has no |SERIES NAME on the columns and has two series
    # https://localhost:8443/api/0.1/columninfo/by_table_kind_and_type/?schema=aus_census_2011&kind=Persons&type=Selected%20Person%20Characteristics%20by%20Indigenous%20Status%20by%20Sex&tablePopulationName=&profileTablePrefix=i01
    "i01": {
        "rows": ["Total persons", "Age groups 0-4 years", "Age groups 5-14 years", "Age groups 15-24 years", "Age groups 25-44 years", "Age groups 45-64 years", "Age groups 65 years and over", "Counted on Census Night At home", "Counted on Census Night Elsewhere in Australia", "Visitor from Same Statistical Area Level 2 (SA2)", "Visitor from Different SA2 in New South Wales", "Visitor from Different SA2 in Victoria", "Visitor from Different SA2 in Queensland", "Visitor from Different SA2 in South Australia", "Visitor from Different SA2 in Western Australia", "Visitor from Different SA2 in Tasmania", "Visitor from Different SA2 in Northern Territory", "Visitor from Different SA2 in Australian Capital Territory", "Visitor from Different SA2 in Other Territories", "Visitor from Different SA2 in Total", "Visitor from Total visitors", "Language spoken at home English only", "Language spoken at home Australian Indigenous Language", "Speaks Australian Indigenous Language & speaks English Not well or not at all", "Speaks Australian Indigenous Language & speaks English Very well or well", "Australian Aboriginal Traditional Religion"],
        "rowPrefixes": ["Age groups", "Counted on Census night", "Visitor from", "Visitor from Different SA2 in", "Language spoken at home", "Speaks Australian Indigenous Language & speaks English"],
        "seriesName": None,
        "secondaryConceptName": None,
    },
    # Proficiency in Spoken English/Language by Year of Arrival in Australia by Sex (B11)
    # @TODO Has |SERIES NAME, but only two profile tables (a and b) that don't line up with the three serieses
    # https://localhost:8443/api/0.1/columninfo/by_table_kind_and_type/?format=json&kind=Persons+born+overseas&profileTablePrefix=b11&schema=aus_census_2011&tablePopulationName=PERSONS&type=Proficiency+in+Spoken+English%2FLanguage+by+Year+of+Arrival+in+Australia+by+Sex
    "b11": {
        "rows": ["Speaks English only", "Speaks other language and speaks English Very well or well", "Speaks other language and speaks English Not well or not at all", "Speaks other language and speaks English Proficiency in English not stated", "Speaks other language and speaks English Total", "Language and proficiency in English not stated", "Total"],
        "rowPrefixes": ["Speaks other language and speaks English"],
        "seriesName": "Persons",
        "secondaryConceptName": None,
        "secondaryConceptNamePrefixes": ["Year of arrival"],
    }
}


def parse2011ColumnSimple(json_metadata, table):
    # FIXME Just for Census
    if "type" in json_metadata:
        json_metadata["type"] = json_metadata["type"].strip(
        ).replace("_", " ")

        def getSeriesName(kind):
            return None if "|" not in kind else kind.split("|")[1]

        def formatSeriesName(seriesName):
            return seriesName.replace("-", " ")

        def formatRowLabel(rowLabel):
            return rowLabel.replace("-", " ").replace("–", " ").replace(",", "").replace("/", " ").replace("$", "").replace("&", "and")

        def formatColumnLabel(columnLabel):
            return columnLabel.strip().replace(":", "").replace("-", " ").replace("$", "").replace(":", "").replace("\\", "").replace("&", "and").replace("/ ", " ").replace("etc.", "etc")

        def formatHumanReadableRowLabel(rowLabel):
            rowLabel = rowLabel.replace("–", "-").strip()

            # Make currency ranges look nicer
            match = re.search(
                r"(?P<rangeStart>[0-9]+)\s(?P<rangeEnd>[0-9]+)", rowLabel)
            if match is not None:
                rangeStart = "{:,}".format(int(match.group("rangeStart")))
                rangeEnd = "{:,}".format(int(match.group("rangeEnd")))
                rowLabel = "${}-${}".format(rangeStart, rangeEnd)

            return rowLabel

        def formatHumanReadableColumnLabel(columnLabel):
            return columnLabel.strip()

        # @TODO
        # x24 fails because of lack of "with" in kind to match type
        # t25 fails because of a typo (0 299 vs 1 299)

        columnType = json_metadata["type"].strip()
        columnLabel = formatColumnLabel(json_metadata["kind"])
        seriesName = getSeriesName(json_metadata["kind"])

        if seriesName is not None:
            seriesName = formatSeriesName(seriesName)

            # {SERIES NAME} {ROW LABEL} {COLUMN LABEL}
            # e.g. Persons Speaks other language and speaks English Total Year of arrival 2010
            # Series = Persons, Row = Speaks other language and speaks English Total, Column = Year of arrival 2010
            match = re.search(r"(?P<seriesName>{seriesName}) (?P<rowLabel>[A-z0-9\s]+) (?P<columnLabel>{columnLabel})".format(
                seriesName=seriesName, columnLabel=columnLabel), columnType, re.IGNORECASE)
            # match = re.search(r"(?P<seriesName>{seriesName}) (?P<rowLabel>{rowLabel}) (?P<columnLabel>[A-z0-9 ]+)".format(seriesName=seriesName, rowLabel=formatRowLabel(rowLabel)), columnType, re.IGNORECASE)
            if match is not None:
                json_metadata["type_old"] = json_metadata["type"]
                json_metadata["kind_old"] = json_metadata["kind"]

                json_metadata["seriesName"] = seriesName
                json_metadata["type"] = formatHumanReadableRowLabel(
                    match.group("rowLabel"))
                # Everything before the pipe is the column label, everything after is the series name
                # e.g. "Owner managers of unincorporated enterprises|MALES"
                # Column = Owner managers of unincorporated enterprises | Series = MALES
                json_metadata["kind"] = formatHumanReadableColumnLabel(
                    json_metadata["kind"].split("|")[0])

        else:
            # {ROW LABEL} {COLUMN LABEL}
            # e.g. 150 299 Dwelling structure Flat unit or apartment In a 1 or 2 storey block
            # Row = 150 299, Column = Dwelling structure Flat unit or apartment In a 1 or 2 storey block
            # print(columnLabel)
            match = re.search(r"(?P<rowLabel>[A-z0-9\s]+) (?P<columnLabel>{columnLabel})".format(
                columnLabel=columnLabel), columnType, re.IGNORECASE)
            # match = re.search(r"(?P<rowLabel>{rowLabel}) (?P<columnLabel>[A-z0-9 ]+)".format(rowLabel=formatRowLabel(rowLabel)), columnType, re.IGNORECASE)
            if match is not None:
                json_metadata["type_old"] = json_metadata["type"]
                json_metadata["kind_old"] = json_metadata["kind"]

                json_metadata["seriesName"] = None
                json_metadata["type"] = formatHumanReadableRowLabel(
                    match.group("rowLabel"))
                json_metadata["kind"] = formatHumanReadableColumnLabel(
                    json_metadata["kind"])

        if "seriesName" not in json_metadata:
            # print(json_metadata["type"])
            raise Exception("Failed to parse column: '{kind}' // '{type}'".format(
                kind=json_metadata["kind"], type=json_metadata["type"]))

    return json_metadata


def parse2011Table(json_metadata):
    # FIXME Just for Census
    if "type" in json_metadata:
        json_metadata["type"] = json_metadata["type"].strip(
        ).replace("_", " ")

        ################################################################################
        # Parsing table names into the concepts contained therein. See the exhaustive
        # documentation in ColumnInfoJSONMetadataField for more info.
        # e.g.
        # Table: 1990
        # Kind: Families in family households"
        # Type: Total Family Income (weekly) by Landlord Type by Family Composition
        ################################################################################
        if " by " in json_metadata["type"]:
            conceptsTemp = json_metadata["type"].split(" by ")

            # Handle cases like "Total Household Income (weekly) by Landlord Type for Family Households" (TableId 1999)
            if " for " in conceptsTemp[1]:
                conceptsTemp[1] = conceptsTemp[1].split(" for ")[0]

            json_metadata["concepts"] = {
                "primary": conceptsTemp[0],
                "secondary": conceptsTemp[1],
            }
            if len(conceptsTemp) > 2:
                json_metadata["concepts"]["tertiary"] = conceptsTemp[2]
        else:
            json_metadata["concepts"] = {
                "primary": json_metadata["type"],
            }
    return json_metadata
