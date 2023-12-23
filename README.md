## 阿里雲OSS上傳插件 (Nodebb Plugin Alioss Uploads)

A plugin for NodeBB to take file uploads and store them on Aliyun OSS.

### Install
`npm install nodebb-plugin-alioss-uploads`

| Plugin Version | Dependency     | Version Requirement     |
| ---------------| -------------- |:-----------------------:|
| 1.0.0          | NodeBB         | >= 3.2.0 |



## Aliyun OSS Configuration

You can configure this plugin via a combination of the below, for instance, you can use **environment variables**. You can also configure via the NodeBB Admin panel, which will result in the Bucket and Credentials being stored in the NodeBB Database.

If you choose to use the Database storage for Credentials, then they will take precedence over Environment Variables, the full load order is:

1. Database
2. Environment Variables

### Environment Variables

```
export OSS_ACCESS_KEY_ID="your_access_key_id"
export OSS_SECRET_ACCESS_KEY="your_secret_access_key"
export OSS_DEFAULT_REGION="oss-cn-hangzhou"
export OSS_UPLOADS_BUCKET="your_bucket"
export OSS_UPLOADS_HOST="host"
export OSS_UPLOADS_PATH="path"
```

**NOTE:** Asset host is optional - If you do not specify an asset host, then the default asset host is `<bucket>.<endpoint>.aliyuncs.com`.

**NOTE:** Asset path is optional - If you do not specify an asset path, then the default asset path is `/`.

### Database Backed Variables

From the NodeBB Admin panel, you can configure the following settings to be stored in the Database:

* `bucket` — The OSS bucket to upload into
* `host` - The base URL for the asset.  **Typcially http://\<bucket\>.\<endpoint\>.aliyuncs.com**
* `region` - The endpoint of the OSS. **like oss-cn-hangzhou**
* `path` - The asset path (optional)
* `accessKeyId` — The OSS Access Key Id
* `secretAccessKey` — The OSS Secret Access Key

**NOTE: Storing your OSS Credentials in the database is bad practice, and you really shouldn't do it.**

## Contributing
Feel free to fork and pull request.

## Local Install or Test
[Official Docs](https://docs.nodebb.org/development/plugins/#linking-the-plugin)
> 1. Recommended to install nodebb before local install
> 2. Install plugin dependencies before link (I'm not sure that's necessary)

### Update (Install Locally)
If the plugin is already installed and active, simply click `Rebuild & Restart` after the code update.


#### Reference
- [NodeBB S3 Uploads Plugin](https://github.com/NodeBB-Community/nodebb-plugin-s3-uploads)
- [NodeBB Aliyun OSS Plugin](https://github.com/ziofat/nodebb-plugin-ali-oss) (Outdated version)