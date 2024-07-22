import csv
import json
import os
import requests
from datetime import datetime

# This script reads data from a CSV file and posts it to an API endpoint.
def csv_to_json_entries(csv_file_name):
    entries = []
    
    # Get the path of the CSV file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file_path = os.path.join(script_dir, csv_file_name)
    
    # Mapping of category names to category numbers, these numbers are the category IDs in the API, please check the strapi content manager for the unique IDs
    # If the category is not in the mapping, the entry will be skipped
    # All the categories are lowercase to allow better matching
    category_mapping = {
        "baby": 13,
        "cleaning": 18,
        "clothing": 12,
        "cooking": 16,
        "education": 17,
        "electronic": 14,
        "food": 7,
        "health": 20,
        "household": 10,
        "hygiene": 8,
        "infrastructure": 11,
        "medical": 21,
        "office": 22,
        "religious": 23,
        "safety": 24,
        "shelter": 9,
        "toys & activities": 15,
        "w.a.s.h.": 19
    }

    def get_category_number(category_name):
        return category_mapping.get(category_name.lower())

    def parse_number(value, default=0):
        try:
            return float(value.replace(',', '').replace('$', '')) if value else default
        except (ValueError, TypeError):
            return default
    
    def parse_integer(value, default=0):
        try:
            return int(value.replace(',', '').replace('$', '')) if value else default
        except (ValueError, TypeError):
            return default

    def parse_string(value, default="No Info"):
        return value if value else default
    
    def parse_enum(value, valid_values):
        return value if value in valid_values else None
    
    def parse_date(value):
        try:
            return datetime.strptime(value, "%Y-%m-%d").date().isoformat() if value else None
        except ValueError:
            return None

    # Check if all required fields are present in the entry
    def has_required_fields(entry, required_fields):
        return all(field in entry and entry[field] for field in required_fields)

    # Read the CSV file and convert it to JSON entries
    # Please edit these codes if the CSV file structure is different!
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            category_number = get_category_number(row["Category"])
            if category_number is None:
                continue
            
            entry = {
                "data": {
                    "name": parse_string(row["Item"]),
                    "age_gender": parse_string(row["Age / Gender"], None),
                    "size_style": parse_string(row["Size / Style / Contents"], None),
                    "category": category_number,
                    "packSize": parse_integer(row["Pack Size"], 1)
                }
            }

            volume = {
                "packageVolume": parse_number(row["Package Volume"]),
                "volumeUnit": parse_enum(row["Volume unit"], ["cubic in", "cubic cm", "cubic ft", "cubic m"]),
                "countPerPackage": parse_integer(row["Count / Package"], 1),
                "itemVolumeCBCM": parse_number(row["Item Volume"], None),
                "countPerCBM": parse_number(row["Count / CBM"], None),
                "volumeSource": parse_string(row["Volume Source"], None),
                "logDate": parse_date(row["Volume Log Date"]),
                "notes": parse_string(row["Volume Notes"], None)
            }

            weight = {
                "packageWeight": parse_number(row["Package Weight"]),
                "packageWeightUnit": parse_enum(row["Weight Unit"], ["lb", "oz", "g", "kg"]),
                "countPerPackage": parse_integer(row["Count / Package"], 1),
                "itemWeightKg": parse_number(row["Item Weight"], None),
                "countPerKg": parse_number(row["Count / KG"], None),
                "weightSource": parse_string(row["Weight Source"], None),
                "logDate": parse_date(row["Weight Log Date"]),
                "notes": parse_string(row["Weight Notes"], None)
            }

            needsMet = {
                "Items": parse_integer(row["# Items"], None),
                "People": parse_integer(row["# People"], None),
                "Type": parse_enum(row["Type"], ["DA", "SPHERE"]),
                "Months": parse_integer(row["# Months"], None),
                "MonthlyNeedsMetPerUnit": parse_number(row["# Monthly Needs Met / Unit"], None),
                "Notes": parse_string(row["Needs Met Notes"], None)
            }

            secondHand = {
                "canBeUsed": False if row["Cost Adjustment if Used"] == "N/A" else True,
                "priceAdjustment": parse_number(row["Cost Adjustment if Used"], 0)
            }

            value = {
                "Price": parse_number(row["Value"], None),
                "Count": parse_integer(row["Count"], None),
                "PricePerUnit": parse_number(row["$ / Unit"], None),
                "PricingSource": parse_string(row["Pricing Source"], None),
                "LogDate": parse_date(row["Value Log Date"]),
                "Notes": parse_string(row["Value Notes"], None)
            }

            # Please edit these codes if the required fields are different!
            if has_required_fields(volume, ["packageVolume", "volumeUnit", "volumeSource", "logDate"]):
                entry["data"]["volume"] = [volume]
            if has_required_fields(weight, ["packageWeight", "packageWeightUnit", "weightSource", "logDate"]):
                entry["data"]["weight"] = [weight]
            if any(needsMet.values()):
                entry["data"]["needsMet"] = needsMet
            if secondHand["canBeUsed"]:
                entry["data"]["secondHand"] = secondHand
            if any(value.values()):
                entry["data"]["value"] = [value]

            entries.append(entry)

    return entries

def post_entries_to_api(entries, api_url, api_key):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    for entry in entries:
        response = requests.post(api_url, headers=headers, json=entry)
        if response.status_code in (200, 201):
            print(f"Successfully added: {entry['data']['name']}")
        else:
            print(f"Failed to add: {entry['data']['name']}. Status code: {response.status_code}, Response: {response.text}")

if __name__ == "__main__":
    csv_file_name = 'YOUR_DOWNLOADED_ITEM_FILE.csv'
    
    entries = csv_to_json_entries(csv_file_name)
    
    # Post data to API
    api_url = "YOUR API URL" # Similar to this "https://1337-distributea-aggregatedp-1wuxcx1b76b.ws-us115.gitpod.io/api/items" 
    api_key = "YOUR API KEY" # Similar to this "b7694b5...it's very long"  
    post_entries_to_api(entries, api_url, api_key)
