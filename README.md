## 阿里雲OSS上傳插件
**plugin-name**: `nodebb-plugin-alioss-uploads`

用於將forum中上傳的文件轉爲使用阿里雲OSS，而不使用本地存儲空間

### Install
進入到nodebb目錄下，執行 `npm link path/to/plugin`

### Remove
- `npm unlink <plugin-name>` 爲移除項目下插件的安裝
- `npm remove -g <plugin-name>` 爲刪除該link
> \<plugin-name\> 爲插件名，插件名爲`package.json`下的`name`

### Update
如插件已Install並且已Active，則在代碼修改後直接`Rebuild & Restart`即可。


#### 參考link
- [NodeBB S3 Uploads Plugin](https://github.com/NodeBB-Community/nodebb-plugin-s3-uploads)
- [NodeBB Aliyun OSS Plugin](https://github.com/ziofat/nodebb-plugin-ali-oss) (已過期版本)