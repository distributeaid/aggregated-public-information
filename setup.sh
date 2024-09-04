#!/bin/bash

# Path to your example .env file
EXAMPLE_ENV_FILE=".env.example"
ENV_FILE=".env"

# Create a new .env file
cp ${EXAMPLE_ENV_FILE} ${ENV_FILE}
echo "Creating new .env file"

# Function to generate a valid key
generate_valid_key() {
  while true; do
    # Generate a base64 key
    KEY=$(openssl rand -base64 16)

    # Check if the key contains only allowed characters (alphanumeric and '=' sign)
    if echo "$KEY" | grep -qE '^[a-zA-Z0-9=]+$'; then
      echo "$KEY"
      return
    fi
  done
}

# Loop to generate 8 keys and replace them in the .env file
for i in $(seq 1 8); do
  # Generate a valid key
  VALID_KEY=$(generate_valid_key)

  # Ensure the placeholder exists in the .env file
  if ! grep -q "key${i}==" "$ENV_FILE"; then
    echo "key${i}==" >> "$ENV_FILE"
  fi

  # Replace the placeholder in the .env file using portable sed syntax
  sed -i.bak "s/key${i}==/${VALID_KEY}/" "$ENV_FILE" && rm -f "$ENV_FILE.bak"

  echo "Replaced key${i}== with $VALID_KEY in $ENV_FILE"
done

echo "All 8 keys have been generated and replaced in $ENV_FILE."