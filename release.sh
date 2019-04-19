#!/bin/bash

# verify prerequisites

git diff --exit-code > /dev/null

if [[ $? != 0 ]]; then
  echo you have uncommitted changes
  exit
fi

git diff --cached --exit-code > /dev/null

if [[ $? != 0 ]]; then
  echo you have uncommitted changes
  exit
fi

set -e


echo -n "prior version: "
read prior_version
echo -n "new version: "
read new_version


sed -i s/$prior_version/$new_version/g site/*.html

git diff

echo -n "Proceed? [y/N] "
read -n 1 proceed
echo

if [[ $proceed != "Y" && $proceed != "y" ]]; then
  exit 1
fi

git add -u
git commit -m "Release version $new_version: update links"


if [[ $USE_MAVEN_JAVADOC ]]; then
  (mkdir site/javadoc/agent-api/$new_version && cd site/javadoc/agent-api/$new_version && curl https://repo1.maven.org/maven2/org/glowroot/glowroot-agent-api/$new_version/glowroot-agent-api-$new_version-javadoc.jar | jar x)

  (mkdir site/javadoc/agent-plugin-api/$new_version && cd site/javadoc/agent-plugin-api/$new_version && curl https://repo1.maven.org/maven2/org/glowroot/glowroot-agent-plugin-api/$new_version/glowroot-agent-plugin-api-$new_version-javadoc.jar | jar x)
else
  (mkdir site/javadoc/agent-api/$new_version && cd site/javadoc/agent-api/$new_version && jar xf /c/git/glowroot/agent/api/target/glowroot-agent-api-$new_version-javadoc.jar)

  (mkdir site/javadoc/agent-plugin-api/$new_version && cd site/javadoc/agent-plugin-api/$new_version && jar xf /c/git/glowroot/agent/plugin-api/target/glowroot-agent-plugin-api-$new_version-javadoc.jar)
fi

git add site/javadoc/agent-api/$new_version
git add site/javadoc/agent-plugin-api/$new_version

git commit -m "Release version $new_version: update javadocs"

git push

grunt

mkdir -p dist/latest
curl -L -o dist/latest/glowroot-latest-dist.zip https://github.com/glowroot/glowroot/releases/download/v$new_version/glowroot-$new_version-dist.zip
curl -L -o dist/latest/glowroot-central-latest-dist.zip https://github.com/glowroot/glowroot/releases/download/v$new_version/glowroot-central-$new_version-dist.zip
curl -L -o dist/latest/glowroot-central-latest-dist.war https://github.com/glowroot/glowroot/releases/download/v$new_version/glowroot-central-$new_version-dist.war

AWS_DEFAULT_REGION=us-east-1 aws.cmd s3 sync dist s3://glowroot.org
