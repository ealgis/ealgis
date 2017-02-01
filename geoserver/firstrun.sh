MASTERPWORD_FILE=${GEOSERVER_DATA_DIR}"/security/masterpw.info"

echo "Checking if GeoServer's firstrun settings can be applied..."
if [ ! -d "${GEOSERVER_DATA_DIR}" ]; then
    echo "Cannot apply firstrun settings. GeoServer data directory does not exist yet at ${GEOSERVER_DATA_DIR}."
fi

if [ ! -f "$MASTERPWORD_FILE" ]; then
    echo "Cannot apply firstrun settings. The master password file has already been removed at $MASTERPWORD_FILE."
fi

echo "###############################################################"
echo "GeoServer container appears to be newly initialised - applying EALGIS GeoServer config."
echo "(We found a GeoServer data directory with a masterpw.info file still present.)"
echo

echo "Copying initial config files to ${GEOSERVER_DATA_DIR}."
cp -a --verbose ./initial_config/. ${GEOSERVER_DATA_DIR}
echo "Files copied OK."
echo

echo "THIS IS YOUR MASTERPASSWORD FOR THE GEOSERVER ROOT USER. DO NOT LOSE IT."
cat $MASTERPWORD_FILE
echo

echo "Removing masterpw.info file."
rm $MASTERPWORD_FILE
echo

echo "Firstrun settings applied OK."
echo

echo "Three steps remaining:"
echo "1. Save your GeoServer root account password (see above) somewhere secure. You'll need it to get into GeoServer if you lose your credentials for the admin account."
echo "2. Login to http://localhost:8080/geoserver/web/ and change the password for the 'admin' user."
echo "3. Update web-variables.env in EALGIS root with the new admin password."
echo "###############################################################"