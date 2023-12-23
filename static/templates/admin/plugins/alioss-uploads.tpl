<div class="acp-page-container">
	<div component="settings/main/header" class="row border-bottom py-2 m-0 sticky-top acp-page-main-header align-items-center">
		<div class="col-12 col-md-8 px-0 mb-1 mb-md-0">
			<h4 class="fw-bold tracking-tight mb-0">{title}</h4>
		</div>
	</div>

	<div class="row m-0">
		<div id="spy-container" class="col-12 px-0 mb-4" tabindex="0">
			<div class="alert alert-warning">
				<p class="text-danger mb-0 font-weight-bold">!!! 非開發人員請勿操作本頁內容</p>
				<p class="text-danger mb-0 font-weight-bold">!!! Non-developers please do not operate the content of this page</p>
			</div>

			<p>You can configure this plugin via a combination of the below, for instance, you can use <em>environment variables</em> in combination. 
				You can also specify values in the form below, and those will be stored in the database.</p>

			<h3>Environment Variables</h3>
<pre><code>export OSS_ACCESS_KEY_ID="your access key id"
export OSS_ACCESS_KEY_SECRET="your access key secret"
export OSS_UPLOADS_BUCKET="bucket"
export OSS_DEFAULT_REGION="oss-cn-hangzhou"
export OSS_UPLOADS_HOST="host"
export OSS_UPLOADS_PATH="path"
</code></pre>

			<p>
				Asset host and asset path are optional. You can leave these blank to default to the standard asset url -
				http://mybucket.oss-cn-hangzhou.aliyuncs.com/uuid.jpg.<br/>
				Asset host can be set to a custom asset host. For example, if set to cdn.mywebsite.com then the asset url is
				http://cdn.mywebsite.com/uuid.jpg.<br/>
				Asset path can be set to a custom asset path. For example, if set to /assets, then the asset url is
				http://mybucket.oss-cn-hangzhou.aliyuncs.com/assets/uuid.jpg.<br/>
				If both are asset host and path are set, then the url will be http://cdn.mywebsite.com/assets/uuid.jpg.
			</p>

			<h3>Database Stored configuration:</h3>
			<form id="oss-upload-bucket">
				<div class="mb-3">
					<label class="form-label" for="ossbucket">Bucket</label>
					<input type="text" id="ossbucket" name="bucket" value="{bucket}" title="OSS Bucket" class="form-control" placeholder="OSS Bucket">
				</div>

				<div class="mb-3">
					<label class="form-label" for="osshost">Host</label>
					<input type="text" id="osshost" name="host" value="{host}" title="OSS Host" class="form-control" placeholder="website.com">
				</div>

				<div class="mb-3">
					<label class="form-label" for="osspath">Path</label>
					<input type="text" id="osspath" name="path" value="{path}" title="OSS Path" class="form-control" placeholder="/assets">
				</div>

				<div class="mb-3">
					<label class="form-label" for="oss-region">Region</label>
					<select id="oss-region" name="region" title="OSS Region" class="form-select">
						<option value="">..</option>
						<option value="oss-cn-hangzhou">Standard (oss-cn-hangzhou)</option>
						<option value="oss-cn-shanghai">oss-cn-shanghai</option>
						<option value="oss-cn-nanjing">oss-cn-nanjing</option>
						<option value="oss-cn-fuzhou">oss-cn-fuzhou</option>
						<option value="oss-cn-wuhan-lr">oss-cn-wuhan-lr</option>
						<option value="oss-cn-qingdao">oss-cn-qingdao</option>
						<option value="oss-cn-beijing">oss-cn-beijing</option>
						<option value="oss-cn-zhangjiakou">oss-cn-zhangjiakou</option>
						<option value="oss-cn-huhehaote">oss-cn-huhehaote</option>
						<option value="oss-cn-wulanchabu">oss-cn-wulanchabu</option>
						<option value="oss-cn-shenzhen">oss-cn-shenzhen</option>
						<option value="oss-cn-heyuan">oss-cn-heyuan</option>
						<option value="oss-cn-guangzhou">oss-cn-guangzhou</option>
						<option value="oss-cn-chengdu">oss-cn-chengdu</option>
						<option value="oss-cn-hongkong">oss-cn-hongkong</option>
						<option value="oss-us-west-1">oss-us-west-1</option>
						<option value="oss-us-east-1">oss-us-east-1</option>
						<option value="oss-ap-northeast-1">oss-ap-northeast-1</option>
						<option value="oss-ap-northeast-2">oss-ap-northeast-2</option>
						<option value="oss-ap-southeast-1">oss-ap-southeast-1</option>
						<option value="oss-ap-southeast-2">oss-ap-southeast-2</option>
						<option value="oss-ap-southeast-3">oss-ap-southeast-3</option>
						<option value="oss-ap-southeast-5">oss-ap-southeast-5</option>
						<option value="oss-ap-southeast-6">oss-ap-southeast-6</option>
						<option value="oss-ap-southeast-7">oss-ap-southeast-7</option>
						<option value="oss-ap-south-1">oss-ap-south-1</option>
						<option value="oss-eu-central-1">oss-eu-central-1</option>
						<option value="oss-eu-west-1">oss-eu-west-1</option>
						<option value="oss-me-east-1">oss-me-east-1</option>
						<option value="oss-rg-china-mainland">oss-rg-china-mainland</option>
					</select>
				</div>
				<button class="btn btn-primary" type="submit">Save</button>
			</form>

			<hr/>

			<form id="oss-upload-credentials">
				<label class="form-label mb-2" for="bucket">Credentials</label>
				<div class="alert alert-warning">
					Configuring this plugin using the fields below is <strong>NOT recommended</strong>, as it can be a potential
					security issue. We highly recommend that you investigate using <strong>Environment Variables</strong>
				</div>
				<input type="text" name="accessKeyId" value="{accessKeyId}" title="Access Key ID" class="form-control mb-3" placeholder="Access Key ID">
				<input type="text" name="secretAccessKey" value="{secretAccessKey}" title="Secret Access Key" class="form-control mb-3" placeholder="Secret Access Key">
				<button class="btn btn-primary" type="submit">Save</button>
			</form>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
