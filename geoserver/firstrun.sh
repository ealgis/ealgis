MASTERPWORD_FILE=${GEOSERVER_DATA_DIR}"/security/masterpw.info"

echo "Checking if firstrun settings can be applied..."
if [ ! -d "${GEOSERVER_DATA_DIR}" ]; then
    echo "Cannot apply firstrun settings. GeoServer data directory does not exist yet at ${GEOSERVER_DATA_DIR}."
fi

if [ ! -f "$MASTERPWORD_FILE" ]; then
    echo "Cannot apply firstrun settings. The master password file has already been removed at $MASTERPWORD_FILE."
fi

echo "OK. The GeoServer data directory appears to be brand new."
echo

echo "Copying base config files to ${GEOSERVER_DATA_DIR}."
cp -a --verbose ./initial_config/. ${GEOSERVER_DATA_DIR}
echo "Files copied OK."
echo

echo "Removing masterpw.info file."
cat $MASTERPWORD_FILE
rm $MASTERPWORD_FILE
echo

echo "Firstrun settings applied OK."
echo

echo "Three steps remaining:"
echo "1. Copy and securely save your root account password from above."
echo "2. Restart your GeoServer Docker container."
echo "3. Login to GeoServer and change the password for the 'admin' user."