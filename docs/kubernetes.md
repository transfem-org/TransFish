# Running a Calckey server with Kubernetes and Helm

There is a [Helm](https://helm.sh/) chart directory found [here](../charts/calckey/README.md)
that you can use to deploy Calckey to a Kubernetes cluster

## Basic Usage

1. Copy the example helm values file:
```shell
cp .config/helm_values_example.yml .config/helm_values.yml
```

2. Edit your `.config/helm_values.yml` to match your needs. See [chart default values](../charts/calckey/values.yaml) for all possible options. At a minimum, update the following fields:
```yaml
calckey:
  domain: example.tld

ingress:
  hosts:
    - host: example.tld
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls:
    - secretName: example-tld-certificate
      hosts:
        - example.tld

postgresql:
  auth:
    password: CHANGEME
    postgresPassword: CHANGEME
  primary:
    persistence:
      enabled: true
      storageClass: example-storage-class

redis:
  auth:
    password: CHANGEME
  master:
    persistence:
      storageClass: example-storage-class
```

3. Update helm dependencies:
```shell
cd charts/calckey
helm dependency list $dir 2> /dev/null | tail +2 | head -n -1 | awk '{ print "helm repo add " $1 " " $3 }' | while read cmd; do $cmd; done;
cd ../../
```

4. Create the calckey helm release (also used to update an existing deployment):
```shell
helm upgrade \
    --install \
    --namespace calckey \
    --create-namespace \
    calckey charts/calckey/ \
    -f .config/helm_values.yml
```

5. Watch your calckey server spin up:
```shell
kubectl -n calckey get po -w
```

6. Any time you make changes to `.config/helm_values.yml`, re-run the helm upgrade command in step 4 to apply the changes.

7. Enjoy!

## Advanced Usage

### Connect to external PostgreSQL, Redis, or Elasticsearch

Edit `.config/helm_values.yml` to disable the built-in update the settings to meet your needs:
```yaml
postgresql:
  enabled: false
  hostname: database.example.tld
  port: 5432
  auth:
    database: calckey_production
    username: calckey
    password: CHANGEME

redis:
  enabled: false
  hostname: redis.example.tld
  port: 6379
  db: 0
  auth:
    password: CHANGEME

elasticsearch:
  enabled: false
  hostname: elasticsearch.example.tld
  port: 9200
  ssl: false
  auth:
    username: myuser
    password: CHANGEME
```

### Managed Configuration
**[WARNING] This is an advanced option. Use at your own risk!**

Edit `.config/helm_values.yml` and set `calckey.isManagedHosting` to `true` and the settings you want to manage:
```yaml
calckey:
  isManagedHosting: true
  libreTranslate:
    managed: true
    apiUrl: "https://translate.example.tld/translate"
    apiKey: "totallyFakeKey"
  smtp:
    managed: true
    from_address: noreply@example.tld
    port: 587
    server: smtp.gmail.com
    useImplicitSslTls: false
    login: me@example.tld
    password: CHANGEME
  objectStorage:
    managed: true
    baseUrl: https://example-bucket.nyc3.cdn.digitaloceanspaces.com
    access_key: CHANGEME
    access_secret: CHANGEME
    bucket: example-bucket
    endpoint: nyc3.digitaloceanspaces.com:443
    region: nyc3
```

Initial the admin user and managed config:
```shell
# Change these values to your desired user, password, and the correct host
export CALCKEY_USERNAME="my_desired_admin_handle" && \
export CALCKEY_PASSWORD="myDesiredInitialPassword" && \
export CALCKEY_HOST="example.tld"

# Use the API to create the initial admin user and capture the user token
export CALCKEY_TOKEN=$(curl -X POST https://$CALCKEY_HOST/api/admin/accounts/create  -H "Content-Type: application/json" -d "{ \"username\":\"$CALCKEY_USERNAME\", \"password\":\"$CALCKEY_PASSWORD\" }" | jq -r '.token') && \
echo "Save this token: ${CALCKEY_TOKEN}"

# Use the API to pull in the managed config settings
curl -X POST -H "Authorization: Bearer $CALCKEY_TOKEN" https://$CALCKEY_HOST/api/admin/accounts/hosted
```

You should now be good to go!
Any time you make changes to your managed settings you will need to re-run the
last curl command to tell the API to pull in the latest config changes.
