/* ADS */

function Ads(application, videoPlayer) {
	this.application = application;
	this.videoPlayer = videoPlayer;

	this.adDisplayContainer = new google.ima.AdDisplayContainer(this.videoPlayer.adContainer);

	this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

	this.adsLoader.addEventListener(
		google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
		this.onAdsManagerLoaded,
		false,
		this,
	);

	this.adsManager = null;
}

Ads.prototype.initialUserAction = function() {
	this.adDisplayContainer.initialize();
}

Ads.prototype.requestAds = function() {
	const adsRequest = new google.ima.AdsRequest();

	adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

	this.adsLoader.requestAds(adsRequest);
}

Ads.prototype.contentEnded = function() {
	this.adsLoader.contentComplete();
}

Ads.prototype.onAdsManagerLoaded = function(adsManagerLoadedEvent) {
	const adsRenderingSettings = new google.ima.AdsRenderingSettings();

	this.adsManager = adsManagerLoadedEvent.getAdsManager(this.videoPlayer, adsRenderingSettings);
	this.adsManager.init(this.videoPlayer.width, this.videoPlayer.height, google.ima.ViewMode.NORMAL);
	this.adsManager.start();
	
	this.application.onAdManagerLoaded();
}

/* VIDEOPLAYER */

function VideoPlayer(adContainer) {
	this.adContainer = adContainer;
	this.width = 640;
	this.height = 360;
}

/* APPLICATION */

function Application(containerDiv) {
	this.containerDiv = containerDiv;

	// Create a video player connection
	this.videoPlayer = new VideoPlayer(this.containerDiv);

	// Create an IMA3 link
	this.ads = new Ads(this, this.videoPlayer);
}

Application.prototype.requestAd = function() {
	if (!this.adsDone) {
		// The user clicked/tapped - inform the ads controller that this code
		// is being run in a user action thread.
		this.ads.initialUserAction();

		// At the same time, initialize the content player as well.
		// When content is loaded, we'll issue the ad request to prevent it
		// from interfering with the initialization. See
		// https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/ads#iosvideo
		// for more information.
		this.ads.requestAds();
		this.adsDone = true;
		return;
	}
}

Application.prototype.onAdManagerLoaded = function() {
	this.containerDiv.style.display = 'block';
}

/* SDK */

function SDK() {}

SDK.prototype.init = function () {
	const containerDiv = document.createElement('div');
	containerDiv.style.display = 'none';

	document.body.appendChild(containerDiv);

	this.application = new Application(containerDiv);
}

SDK.prototype.requestAd = function() {
	this.application.requestAd();
}

window.adSDK = new SDK();
