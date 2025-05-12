#!/bin/bash

# the bash launcher script needs mvn, jq and curl to be installed, so check for those first.
which curl > /dev/null || (echo "curl not found, installing..." && brew install curl)
which jq > /dev/null || (echo "jq not found, installing..." && brew install jq)

OPENAPI_GENERATOR_VERSION=7.4.0
MAVEN_VERSION=3.9.9
MAVEN_MAJOR_VERSION="${MAVEN_VERSION%%.*}"

if ! command -v mvn > /dev/null; then
  echo "This script requires mvn to be installed."
  mkdir -p $HOME/bin
  which wget > /dev/null || (echo "wget not found, installing..." && brew install wget)
  wget https://dlcdn.apache.org/maven/maven-$MAVEN_MAJOR_VERSION/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.tar.gz -O $HOME/bin/apache-maven-$MAVEN_VERSION-bin.tar.gz
  tar -xvf $HOME/bin/apache-maven-$MAVEN_VERSION-bin.tar.gz -C $HOME/bin
  export PATH=$HOME/bin/apache-maven-$MAVEN_VERSION/bin:$PATH

  if ! command -v mvn > /dev/null; then
    echo "Failed to install Maven."
    exit 1
  fi
fi

if type -p openapi-generator-cli; then
  # check that the openapi-generator-cli version is 7.4.0
  if [[ "$(openapi-generator-cli version)" != "$OPENAPI_GENERATOR_VERSION" ]]; then
    export OPENAPI_GENERATOR_VERSION=7.4.0
  fi
else
  # install the openapi-generator-cli and set cli version for this script to 7.4.0
  mkdir -p $HOME/bin/openapitools
  curl https://raw.githubusercontent.com/OpenAPITools/openapi-generator/master/bin/utils/openapi-generator-cli.sh > ~/bin/openapitools/openapi-generator-cli
  chmod u+x ~/bin/openapitools/openapi-generator-cli
  export PATH=$PATH:~/bin/openapitools/

#   export OPENAPI_GENERATOR_VERSION=7.4.0
fi

local_script_dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

REPO_NAME="theloveconcierge/tlc_recommendation_api_client"
api_client_dir=$(cut -d '/' -f2 <<< "$REPO_NAME")

tmp_api_client_dir="/tmp/$api_client_dir"

if [[ ! -d "$tmp_api_client_dir" ]]
then
    mkdir -p $tmp_api_client_dir
fi

cp -r $local_script_dir/.openapi-generator-ignore "$tmp_api_client_dir/"
cd $tmp_api_client_dir && pwd


# clone API Client repository
git init
git remote add origin "git@github.com:$REPO_NAME.git"
git pull origin master
git pull --tags

# Delete Old code before re-generating
rm -rf $api_client_dir

# Pre-checks for $API_CLIENT_VERSION
if [ -z "$API_CLIENT_VERSION" ]
then
    echo "Enter the API version."
    read API_CLIENT_VERSION
fi

git_tags=( $( git tag --sort version:refname) )
if [[ " ${git_tags[@]} " =~ " ${API_CLIENT_VERSION} " ]]
then
    echo "API Client version $API_CLIENT_VERSION already exists. Please enter a new version in the format X.Y.Z. These are the versions available:\n${git_tags[@]}\n"
    read API_CLIENT_VERSION
fi


while true; do
    if [[ ! $API_CLIENT_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Enter a valid API version in the format X.Y.Z."
        read API_CLIENT_VERSION
    elif [[ $API_CLIENT_VERSION == "0.0.0" ]]; then
        echo "Version 0.0.0 is not allowed. Please enter a valid API version in the format X.Y.Z."
        read API_CLIENT_VERSION
    else
        break
    fi
done

echo "API Client will be generated with ${API_CLIENT_VERSION}"

echo "Generating API Client"

openapi-generator-cli generate -i "$local_script_dir/openapi.json" \
    -g python -o "$tmp_api_client_dir" \
    -c "$local_script_dir/api_client_config.json" \
    --additional-properties "packageVersion=${API_CLIENT_VERSION}"
echo "Finished generating API Client"


rm -rf $tmp_api_client_dir/.openapi-generator-ignore
rm -rf $tmp_api_client_dir/.openapi-generator


# commit new api client code
git add .
git commit -m "API Client v$API_CLIENT_VERSION"

# delete old latest tage if any
CLIENT_LATEST_TAG="latest"
if [[ " ${git_tags[@]} " =~ " ${CLIENT_LATEST_TAG} " ]]
then
    echo "Deleting the old ${CLIENT_LATEST_TAG} tag."
    git tag -d latest
    git push --delete origin $CLIENT_LATEST_TAG
fi

# tag code with version
git tag $API_CLIENT_VERSION
git tag $CLIENT_LATEST_TAG

# push code to api client repository
git push origin master
git push origin $API_CLIENT_VERSION
git push origin $CLIENT_LATEST_TAG

# remove api client directory
rm -rf $tmp_api_client_dir
cd $local_script_dir && pwd
