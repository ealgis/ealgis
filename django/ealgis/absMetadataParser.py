import re
import json

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


def parse2011ColumnSimple(json_metadata, table, profileTablePrefix):
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

        # if json_metadata["type"] != "Persons Speaks other language and speaks English Very well or well Year of arrival not stated":
        #     return json_metadata

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
    # print(json_metadata)
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


def parse2011Column(json_metadata, table):
    # FIXME Just for Census
    if "type" in json_metadata:
        json_metadata["type"] = json_metadata["type"].strip(
        ).replace("_", " ")

        # e.g. Total Family Income (weekly) by Landlord Type by Family Composition
        # Table Name: COUPLE FAMILIES WITH CHILDREN
        # Column Category: Landlord Type
        # Column Category Value: Real estate agent, ...
        # Column Bucket: 200 299, ...
        # print(json_metadata["type"])

        # See SDMX example/
        # http://stat.data.abs.gov.au/restsdmx/sdmx.ashx/GetDataStructure/ABS_CENSUS2011_B26_LGA

        # What of X12E - The total families table?

        # FIXME Allow opting out of geomlinkage
        # FIXME Surface table name from columns on tableinfo
        # FIXME Choose geometry (Level of detail) at the last possible moment
        # FIXME Why does x12b_aust_sa3 contain two table types? Have we confused 'Datapack file' and 'Profile table'?
        # FIXME Test on a table with only one or two concepts
        # FIXME This is a weird table...
        # Households With Indigenous Person(S)
        # Households with Indigenous persons Owned outright Dwelling structure Separate house

        # FIXME This is for a proof of concept data discovery UI. The MVP version
        # should handle moving this ABS-specific logic somewhere more appropriate.

        # The comments here will use the X12 series of tables in the Extended Community Profile (2011 Census) as an example
        # Table name: Total Family Income (weekly) by Landlord Type by Family Composition
        # Table population: Families in family households

        ################################################################################
        # 1. Extract the name of our table from our metadata_json
        # e.g.
        # Column: x8659
        # Kind: Landlord type: Real estate agent|COUPLE FAMILIES WITH NO CHILDREN
        # Type: Couple families with no children Negative Nil income Landlord type Real estate agent

        # FIXME Once we decide what to do about the difference between Datapack files and Profile
        # tables (See #87) we can get rid of this logic as we'll be able to source that from the table_info metadata instead.

        # Tables name are in the `kind` element in metadata_json and encompass the string to the right of the pipe | character
        # e.g. In this case it's "COUPLE FAMILIES WITH NO CHILDREN"
        ################################################################################
        # print("###")
        # print(json_metadata["kind"])
        # print(json_metadata["type"])
        if "|" in json_metadata["kind"]:
            # e.g. Landlord type: Real estate agent|COUPLE FAMILIES WITH NO CHILDREN
            json_metadata["table_name"] = json_metadata["kind"].split("|")[
                1].title()
        else:
            # e.g. Landlord type: Real estate agent
            # FIXME Wot is this column w/o a table name component after the pipe?
            json_metadata["table_name"] = json_metadata["kind"].title()

        ################################################################################
        # 2a. Parsing "concepts" from the column metadata for regular data columns.
        # To cut a long story short - the ABS Census datapacks contain a lot of unstructured
        # metadata about tables and columns. They present this as structured metadata in other places
        # (e.g. SDMX and ABS.STAT), but in the CSV Datapacks it's all stuffed in a few strings that
        # EALGIS stores in metadata_json for both fields and columns. See #87 for more information.
        #
        # e.g.
        # https://localhost:8443/api/0.1/columninfo/search/?schema=aus_census_2011&tableinfo_name=x12a_aust_sa3
        #
        # Table name: Total Family Income (weekly) by Landlord Type by Family Composition
        # Table population: Families in family households
        # Column: x8659
        # Kind: Landlord type: Real estate agent|COUPLE FAMILIES WITH NO CHILDREN
        # Type: Couple families with no children Negative Nil income Landlord type Real estate agent
        #
        # This table contains three "things":
        # - Total Family Income (weekly)
        # - Landlord type
        # - Family Composition
        #
        # And this column contains three "things":
        # - Landlord type (Label: Value - "Landlord type: Real estate agent")
        # - Family Composition/Table name (Value - "COUPLE FAMILIES WITH NO CHILDREN")
        # - Total Family Income (weekly) (Value - "Negative Nil income")
        #
        # In SDMX-land the ABS refers these "things" as "concepts" (e.g. Landlord type, Family Composition, ...)
        # and to the possible values of each "concept" as "Code lists". (Spatial concepts are also represented in
        # the fashion - but we have better ways of reprsenting those!) See http://stat.data.abs.gov.au/restsdmx/sdmx.ashx/GetDataStructure/ABS_CENSUS2011_B26_LGA
        # for an example from a similar table from ABS.STAT.
        #
        # Having all of these concepts as structured metadata is going to be a big help for the UI and UX of EALGIS.
        # So, let's do some hacky string parsing to turn these unstructured strings into structured metadata!
        ################################################################################

        ################################################################################
        # Now we take one of two paths - Parsing a regular column or parsing a column
        # that represents a total of one or more sets of columns.
        #
        # Total fields can be detected by inspecting the `kind` element in metadata_json to see
        # if it starts with "Total|"
        #
        # There are a few interesting things about total columns that we'll need to handle.
        #
        # e.g.
        # Column: x8668
        # Kind: Total|COUPLE FAMILIES WITH NO CHILDREN
        # Type: Couple families with no children Negative Nil income Total
        ################################################################################
        json_metadata["is_total"] = False
        if json_metadata["kind"].startswith("Total|") or json_metadata["type"].startswith("Total ") or json_metadata["kind"] == "Total":
            json_metadata["is_total"] = True
        # Handle vertical totals e.g. "Couple families with no children Total Landlord type Real estate agent" (ColumnId 260117)
        if "{} {} ".format(json_metadata["table_name"], "Total").lower() in json_metadata["type"].lower():
            json_metadata["is_total"] = True

        json_metadata["is_table_total"] = False
        if json_metadata["type"].endswith(" Total Total") or json_metadata["type"] == "Total Total":
            json_metadata["is_table_total"] = True

        ################################################################################
        # e.g.
        # Column: x8838
        # Kind: Total|COUPLE FAMILIES WITH NO CHILDREN
        # Type: Couple families with no children Total Total
        ################################################################################
        if json_metadata["is_table_total"] is True:
            primaryConcept = {
                "value": "Total"
            }
            secondaryConcept = {
                "label": "",
                "value": "Total",
            }
            tertiaryConcept = {
                "value": json_metadata["type"].split(" Total Total")[0].strip()
            }

        else:
            # Legacy code...
            # if json_metadata["is_total"] is True:
            #     json_metadata["category"] = "Total"
            #     json_metadata["category_value"] = json_metadata["bucket"] = json_metadata["type"].lower().replace(
            #         json_metadata["table_name"].lower(), "").replace(" total", "", (max(1, json_metadata["type"].lower().count(" total") - 1))).strip()

            #     # Is the overall total for the table
            #     if json_metadata["category_value"] == "total":
            #         json_metadata["category_value"] = json_metadata["table_name"]

            ################################################################################
            # 2a1 - Extract the primary concept
            # The primary concept will be the first concept in our array of concepts. In
            # the case of our example table and column this is "Total Family Income (weekly)".
            #
            # Table name: Total Family Income (weekly) by Landlord Type by Family Composition
            #
            # In the column metadata the primary concept is always in the middle of the `type` field
            # in metadata_json. e.g.
            # Type: Couple families with no children Negative Nil income Landlord type Real estate agent
            #
            # This actually represents: "Family Composition" "Total Family Income (weekly)" "Landlord type"
            # Or, looking at it by concepts "Tertiary Concept" "Primary Concept" "Secondary Concept".
            #
            # BUT since we're doing hacky string parsing here, we need to first establish what the
            # Tertiary and Secondary concepts are before we can reliably extract the Primary concept.
            ################################################################################

            ################################################################################
            # 2a2 - Extracting the tertiaty concept
            # The tertiary concept is kinda easy, because it's our table name - and we already have that from
            # our parsing above.
            # e.g.
            # Type: Couple families with no children Negative Nil income Landlord type Real estate agent
            #
            # We need to do some cleaning to remove special characters like brackets that aren't included
            # in the `type` field
            # e.g.
            # Table name: Households With Indigenous Person(S)
            # Type: Households with Indigenous persons Owned outright Dwelling structure Separate house
            ################################################################################
            tertiaryConcept = {
                "value": json_metadata["table_name"].replace("(", "").replace(")", "")
            }

            ################################################################################
            # 2a2 - Extracting the secondary concept
            # The secondary concept is a bit harder, it's always the last concept in the string.
            # e.g.
            # Type: Couple families with no children Negative Nil income Landlord type Real estate agent
            # "Landlord type Real estate agent" (Concept label and Concept value)
            #
            # To hackily parse this we'll need to get the Concept lable from the `kind` field in metadata_json.
            # e.g.
            # Kind: Landlord type: Real estate agent|COUPLE FAMILIES WITH NO CHILDREN
            #
            # This is pretty easy, it's the bit before the first occurence of the :
            # Getting the Concept value is then easy - we can just grab everything in
            # the `type` field that occurs after the Concept label.
            #
            # For our is_total case we can look at e.g.
            # Column: x8668
            # Kind: Total|COUPLE FAMILIES WITH NO CHILDREN
            # Type: Couple families with no children Negative Nil income Total
            ################################################################################
            if json_metadata["is_total"] is True:
                if "|" not in json_metadata["kind"]:
                    if ":" in json_metadata["kind"]:
                        # This concept has both a Label and a Value
                        # e.g. "Landlord type: Landlord type not stated" (ColumnId 261606)
                        # Label: Landlord type
                        # Value: Landlord type not stated
                        # secondaryConceptLabel = json_metadata["kind"].split(":")[
                        #     0].strip()
                        # secondaryConceptValue = json_metadata["kind"].split(
                        #     "{}: ".format(secondaryConceptLabel))[1].split("|")[0].strip()

                        # For cases where we have the table's secondary concept actually used in the
                        # 'kind' as a label
                        if table["metadata_json"]["concepts"]["secondary"].lower() in json_metadata["kind"].lower():
                            # This concept has both a Label and a Value
                            # e.g. "Landlord type: Real estate agent|COUPLE FAMILIES WITH NO CHILDREN"
                            # Label: Landlord type
                            # Value: Real estate agent
                            secondaryConceptLabel = json_metadata["kind"].split(":")[
                                0].strip()
                            secondaryConceptValue = json_metadata["kind"].split(
                                "{}: ".format(secondaryConceptLabel))[1].split("|")[0].strip()

                        else:
                            # For cases like X13 (Mortage Repayment (monthly) by Family Composition) where some columns
                            # have a :, but it's not actually the label for their secondary concept, it's part of the value.
                            # e.g. 'kind' is "Couple family with: Children under 15" and the whole thing is the value.
                            # Also, 'type' doesn't contain the :
                            # NB: Only SOME columns in this table were like this. Grr! Inconsistencies.
                            secondaryConceptLabel = ""
                            secondaryConceptValue = json_metadata["kind"].replace(
                                ":", "").strip()

                    else:
                        # This concept only has a value
                        # e.g. Separate house|HOUSEHOLDS WITH INDIGENOUS PERSON(S)
                        secondaryConceptLabel = ""
                        secondaryConceptValue = json_metadata["kind"]
                else:
                    secondaryConceptLabelAndValue = json_metadata["kind"].split("|")[
                        0].strip()

                    if ":" in secondaryConceptLabelAndValue:
                        # This concept has both a Label and a Value
                        # e.g. "Landlord type: Real estate agent|COUPLE FAMILIES WITH NO CHILDREN"
                        # Label: Landlord type
                        # Value: Real estate agent
                        secondaryConceptLabel = secondaryConceptLabelAndValue.split(":")[
                            0].strip()
                        secondaryConceptValue = secondaryConceptLabelAndValue.split(
                            "{}: ".format(secondaryConceptLabel))[1].split("|")[0].strip()

                    else:
                        # This concept only has a value
                        # e.g. Separate house|HOUSEHOLDS WITH INDIGENOUS PERSON(S)
                        secondaryConceptLabel = ""
                        secondaryConceptValue = secondaryConceptLabelAndValue

            else:
                secondaryConceptLabelAndValue = json_metadata["kind"].split("|")[
                    0].strip()

                if ":" in secondaryConceptLabelAndValue:
                    # For cases where we have the table's secondary concept actually used in the
                    # 'kind' as a label
                    if table["metadata_json"]["concepts"]["secondary"].lower() in json_metadata["kind"].lower():
                        # This concept has both a Label and a Value
                        # e.g. "Landlord type: Real estate agent|COUPLE FAMILIES WITH NO CHILDREN"
                        # Label: Landlord type
                        # Value: Real estate agent
                        secondaryConceptLabel = secondaryConceptLabelAndValue.split(":")[
                            0].strip()
                        secondaryConceptValue = secondaryConceptLabelAndValue.split(
                            "{}: ".format(secondaryConceptLabel))[1].split("|")[0].strip()

                    else:
                        # For cases like X13 (Mortage Repayment (monthly) by Family Composition) where some columns
                        # have a :, but it's not actually the label for their secondary concept, it's part of the value.
                        # e.g. 'kind' is "Couple family with: Children under 15" and the whole thing is the value.
                        # Also, 'type' doesn't contain the :
                        # NB: Only SOME columns in this table were like this. Grr! Inconsistencies.
                        secondaryConceptLabel = ""
                        secondaryConceptValue = secondaryConceptLabelAndValue.replace(
                            ":", "").strip()
                else:
                    # This concept only has a value
                    # e.g. Separate house|HOUSEHOLDS WITH INDIGENOUS PERSON(S)
                    secondaryConceptLabel = ""
                    secondaryConceptValue = secondaryConceptLabelAndValue

            secondaryConcept = {
                "label": secondaryConceptLabel,
                "value": secondaryConceptValue,
            }

            ################################################################################
            # 2a1 - Extract the primary concept (cont.)
            # Ok, now we have the labels and values of the other concepts we can grab the primary
            # concept!
            ################################################################################
            # print("#########")
            # print("Kind:", json_metadata["kind"])
            # print("Type:", json_metadata["type"])
            # print("Secondary concept:", secondaryConcept)
            # print("Tertiary concept:", tertiaryConcept)

            # Replace special characters in Secondary Concept value due to columns like 261463 "Landlord type: Employer: Government", 261465, et al.
            secondaryConceptValueClean = secondaryConcept["value"].replace(
                ":", "").replace("-", " ")

            # Handle cases where 'kind' uses & and 'type' uses 'and' (e.g. ColumnId 266313)
            secondaryConceptValueClean = secondaryConceptValueClean.replace(
                "&", "and")

            # Handle cases where 'kind' includes a "/ "" (line break character followed by a space) and 'type' doesn't (e.g. ColumnId 266317)
            secondaryConceptValueClean = secondaryConceptValueClean.replace(
                "/ ", "/")

            # Handle cases where 'kind' includes a / (line break character without a trailing space) and 'type' doesn't (e.g. ColumnId 617332)
            secondaryConceptValueClean = secondaryConceptValueClean.replace(
                "/", " ").replace("-", " ")

            # Replace special characters in Tertiary Concept value due to columns like 261463 "Landlord type: Employer: Government", 261465, et al.
            tertiaryConceptValueClean = tertiaryConcept["value"]

            # Handle cases where 'kind' includes a / (line break character) or a - and 'type' doesn't (e.g. "FULL/PART-TIME STUDENT STATUS NOT STATED")
            tertiaryConceptValueClean = tertiaryConceptValueClean.replace(
                "/", " ").replace("-", " ")

            # Handle cases where 'kind' uses the plural and 'type' doesn't (e.g. "PART-TIME STUDENTS")
            if tertiaryConceptValueClean.endswith(" Students"):
                tertiaryConceptValueClean = tertiaryConceptValueClean.replace(
                    " Students", " Student")

            if "|" not in json_metadata["kind"]:
                # Handle cases like XCP X24 (X24 MORTGAGE REPAYMENT (MONTHLY) BY DWELLING STRUCTURE) where
                # for SOME columns 'type' has the secondary concept lable (Dwelling structure), but 'kind' doesn't
                if table["metadata_json"]["concepts"]["secondary"] not in json_metadata["kind"]:
                    # Split at the table's secondary concept, not the column's secondary concept (because it has none!)
                    if table["metadata_json"]["concepts"]["secondary"] in json_metadata["type"]:
                        primaryConcept = {
                            "value": json_metadata["type"].lower().split(table["metadata_json"]["concepts"]["secondary"].lower())[0]
                        }
                    else:
                        # Eh, use the same approach as if the secondary concept is not in kind
                        # This handles columns like "0 149 Total" on the aforementioned Mortage Repayments table
                        primaryConcept = {
                            "value": json_metadata["type"].lower().split(secondaryConceptValueClean.lower())[0]
                        }

                    secondaryConcept["label"] = table["metadata_json"]["concepts"]["secondary"]
                else:
                    primaryConcept = {
                        "value": json_metadata["type"].lower().split(secondaryConceptValueClean.lower())[0]
                    }

                tertiaryConcept = None
                json_metadata["table_name"] = ""
            else:
                primaryConcept = {
                    "value": json_metadata["type"].lower().split(tertiaryConceptValueClean.lower())[1].split(secondaryConceptValueClean.lower())[0]
                }

            # Handle cases where the Secondary Concept label is not repeated e.g. "All incomes not stated Landlord type not stated" (ColumnId 261596)
            if secondaryConcept["label"] != "":
                primaryConcept["value"] = primaryConcept["value"].split(
                    secondaryConcept["label"].lower())[0]

            primaryConcept["value"] = primaryConcept["value"].strip(
            ).title()

            # Lastly, let's do some cleaning on the Primary concept value
            # 1. The CSV datapacks include a bunch of formatting characters that we don't need
            primaryConcept["value"] = primaryConcept["value"].replace(
                ":", "").replace("-", " ").replace("/", " ")
            # 2. And if it looks like a number range, let's make it a little more human-readable
            match = re.search(r'[0-9]+ [0-9]+', primaryConcept["value"])
            if match:
                primaryConcept["value"] = primaryConcept["value"].replace(
                    " ", " - ")

        json_metadata["concepts"] = {
            "primary": primaryConcept,
            "secondary": secondaryConcept,
        }
        if tertiaryConcept is not None:
            json_metadata["concepts"]["tertiary"] = tertiaryConcept

        # Legacy code...
        # if json_metadata["is_total"] is False:
        #     json_metadata["category"] = json_metadata["kind"].split(":")[
        #         0].strip()
        #     json_metadata["category_value"] = json_metadata["kind"].replace(
        #         "{}: ".format(json_metadata["category"]), "").split("|")[0].strip()
        #     json_metadata["bucket"] = json_metadata["type"].lower().replace(
        #         json_metadata["table_name"].lower(), "").replace(json_metadata["category_value"].lower().replace(":", "").replace("-", " ").replace("/", " "), "").replace(json_metadata["category"].lower(), "").strip()
        #     if json_metadata["bucket"] == "total":
        #         json_metadata["is_total"] = True

        #     match = re.search(r'[0-9]+ [0-9]+', json_metadata["bucket"])
        #     if match:
        #         json_metadata["bucket"] = json_metadata["bucket"].replace(
        #            " ", " - ")
    return json_metadata
