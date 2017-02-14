(function() {
	var urlpathname = location.pathname;
	var test = urlpathname.includes("citrix-user-profile-store-cleaner");
	if (test) {
		window.location = 'http://www.afinn.net/citrix-user-store-profile-cleaner/';
	}
})();