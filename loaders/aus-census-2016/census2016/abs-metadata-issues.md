Refers to the DataPack Metadata XLS files obtained from https://datapacks.censusdata.abs.gov.au/datapacks/

# Major Issues (Affecting the datapacks themselves)
Time Series Profile
T24 TOTAL HOUSEHOLD INCOME (WEEKLY) BY RENT (WEEKLY)
Column: T9686
The column name in the datapack CSV, as well as the short and long descriptions of the column in the metadata, are misidentified as being part of the "Rent $150 - $149" category. According to the Sequential Template it should be "Rent $150 - $199".

Column: T9700
The column name in the datapack CSV, as well as the short and long descriptions of the column in the metadata, are misidentified as being part of the "Rent $150 - $224" category. According to the Sequential Template it should be "Rent $200 - $224".

ALL TABLES - Metadata
All column headings in the TSP datapack metadata XLS are lacking spaces between their words. This makes automating the process of parsing the metadata a bit of a challenge :)


Aboriginal and Torres Strait Islander Profile
I01 SELECTED PERSON CHARACTERISTICS BY INDIGENOUS STATUS BY SEX
The long description of the column is lacking detail about the population if covers (i.e. Males, Females, or Persons). In this case, it is males and should be "Visitor_from_Total_visitors_Aboriginal_and_or_Torres_Strait_Islander_Males".
I241


# Minor Issues (Typos and the like in the metadata)

General Community Profile
G11 PROFICIENCY IN SPOKEN ENGLISH/LANGUAGE BY YEAR OF ARRIVAL IN AUSTRALIA BY AGE
Column headings mislabelled as "Year of Arrival 2006 - 2015". Should be 2006 - 2010.
Affects columns: G3431, G3453, G3475, G3497, G3519, G3541


Place of Enumeration Profile
P10 COUNTRY OF BIRTH OF PERSON BY YEAR OF ARRIVAL IN AUSTRALIA
Column headings mislabelled as "Year of Arrival 1966 - 1965". Should be 1956 - 1965.
Affects: All rows in the metadata.


Time Series Profile
T12 RELIGIOUS AFFILIATION BY AGE
Colums between T4949 and T4968 have mislabelled column headings. They're coded as being from the 2006 Census, but they're actualy from the 2011 Census.
Colums between T5259 and T5278 have mislabelled column headings. They're coded as being from the 201 Census, but they're actualy from the 2016 Census.

T18 TENURE AND LANDLORD TYPE BY DWELLING STRUCTURE
T7801 column heading just says "itecture". Should be "Dwelling structure Other dwelling|2016Census".

T20 RENT (WEEKLY) BY FAMILY COMPOSITION FOR COUPLE FAMILIES
Colums between T8326 and T8337 have mislabelled column headings. They're coded as being from the 2006 Census, but they're actualy from the 2011 Census.


Aboriginal and Torres Strait Islander Peoples Profile
I02 INDIGENOUS STATUS BY SEX
The colum headings for some of the columns also include the row label. e.g. I514's column heading is labelled as "Indigenous: Total Males". "Total Males" is the column heading and "Indigenous Persons" is the row label.
I514 to I525

Column  Current Column Heading                  Corrected Column Heading
I514    Indigenous: Total Males                 Males
I515    Indigenous: Total Females               Females
I516    Indigenous: Total Persons               Persons
I517    Non-Indigenous Males                    Males
I518    Non-Indigenous Females                  Females
I519    Non-Indigenous Persons                  Persons
I520    Indigenous status not stated: Males     Males
I521    Indigenous status not stated: Females   Females
I522    Indigenous status not stated: Persons   Persons
I523    Total Males                             Males
I524    Total Females                           Females
I525    Total Persons	                          Persons

I10 TENURE AND LANDLORD TYPE BY DWELLING STRUCTURE BY INDIGENOUS STATUS OF HOUSEHOLD
A range of column headings are identified incorrectly.

Columns I1624 to I1944
Labelled as: Other dwelling: Caravan\ cabin\ houseboat
Should be: Other dwelling: Caravan

Labelled as: Other dwelling: Cabin\ houseboat
Should be: Other dwelling: Caravan

Columns I1645 to I1945
Labelled as: Other dwelling: Caravan\ cabin\ houseboat
Should be: Other dwelling: Cabin\ houseboat

A range of columns in the table:
Labelled as: Dwelling structure Flat or apartment
Should be: Dwelling structure Flat unit or apartment

I15 NON-SCHOOL QUALIFICATION: LEVEL OF EDUCATION(a) BY INDIGENOUS STATUS BY AGE BY SEX
Column I2688 is mislabelled as "Certificate Level nfd|FEMALES". It should be "Level of education not stated|FEMALES".