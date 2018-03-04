$.urlParam = function(name, url) {
	if (!url) {
		url = window.location.href;
	}
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
	if (!results) { 
		return undefined;
	}
	return results[1] || undefined;
};

$(document).ready(function() {
	if ($.urlParam('scraped')) {
		$('#introSection').addClass('d-none');
	} 
	
	if ($.urlParam('scraped') && $.urlParam('scraped') !== '0') {
		var confirmEnding = $.urlParam('scraped') === '1' ? ' new article was added!' : ' new articles were added!';
		$('#scrapedConfirm').text($.urlParam('scraped') + confirmEnding)
			.removeClass('d-none');
	} else if ($.urlParam('scraped') && $.urlParam('scraped') === '0') {
		$('#scrapedConfirm').removeClass('alert-success d-none')
			.addClass('alert-danger')
			.text('Sorry, no new articles are available.')
	}
	
	$('#scrape, #scrapeBody').on('click', function(event) {
		$.ajax('/fetch').then(function(response) {
			location.href = '/?scraped=' + response.length;
		});
	});
});