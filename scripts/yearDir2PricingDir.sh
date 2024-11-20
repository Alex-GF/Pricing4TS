#!/usr/bin/env bash

SRC_PRICINGS_PATH="./tests/resources/pricing/full"
DST_PRICINGS_PATH="./tests/resources/pricing/real"
PROJECT_FOLDER_NAME="Pricing4TS"

check_current_directory() {
  CURRENT_DIR=$(basename $(pwd))
  if [ "$CURRENT_DIR" != "$PROJECT_FOLDER_NAME" ]; then
    echo "Execute the script at the root of the project"
    exit 1
  fi
}

check_src_path() {
  if [ ! -d "$SRC_PRICINGS_PATH" ]; then
    echo "$SRC_PRICINGS_PATH is not a directory"
    exit 1
  fi
}

check_dst_path() {
  if [ -e "$DST_PRICINGS_PATH" ]; then
    echo "Directory $DST_PRICINGS_PATH already exists..."
  else
    echo "Creating real directory at $DST_PRICINGS_PATH..."
    mkdir -p "$DST_PRICINGS_PATH"
  fi
}

find_yaml_files() {
  FILES=$(find $SRC_PRICINGS_PATH -type f \( -name "*.yml" -o -name "*.yaml" \) | sort)
  if [ -z "$FILES" ]; then
    echo "No matching files with .yml or .yaml extensions"
    exit 1
  fi
}

create_pricing_directory() {
  PRICING_NAME=$1
  PRICING_FOLDER=$2
  if [[ ! -e $PRICING_FOLDER && $PRICING_YEAR =~ [0-9][0-9][0-9][0-9] ]]; then
    echo "Creating directory for $PRICING_NAME"
    mkdir $PRICING_FOLDER
  fi
}

copy_pricing_file() {
  PRICING_NAME=$1
  PRICING_YEAR=$2
  FILE=$3
  PRICING_FOLDER=$4
  if [[ $PRICING_YEAR =~ [0-9][0-9][0-9][0-9] ]]; then
    echo "Dumping $PRICING_YEAR/$PRICING_NAME.yml into $PRICING_NAME/$PRICING_YEAR.yml"
    cp $FILE "$PRICING_FOLDER/$PRICING_YEAR.yml"
  else
    echo "Dumping $PRICING_NAME in $DST_PRICINGS_PATH folder"
    cp $FILE $DST_PRICINGS_PATH
  fi
}

create_dir_and_copy_files() {
  for file in $FILES
  do
    PRICING_NAME=$(basename $file | cut -d '.' -f1)
    PRICING_YEAR=$(basename $(dirname $file))
    PRICING_FOLDER="$DST_PRICINGS_PATH/$PRICING_NAME"
    
    create_pricing_directory "$PRICING_NAME" "$PRICING_FOLDER"
    copy_pricing_file "$PRICING_NAME" "$PRICING_YEAR" "$file" "$PRICING_FOLDER"
  done
}

check_current_directory
check_src_path
check_dst_path
find_yaml_files
create_dir_and_copy_files
