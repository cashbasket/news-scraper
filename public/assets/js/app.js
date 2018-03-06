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

// Borrowed (with love) from http://locutus.io/php/strip_tags/
function strip_tags (input, allowed) { // eslint-disable-line camelcase
	// making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
  
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  
	var before = input;
	var after = input;
	// recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
	while (true) {
		before = after;
		after = before.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
			return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
		});
  
		// return once no more tags are removed
		if (before === after) {
			return after;
		}
	}
}

function scrollToAnchor(aid){
	var aTag = $('a[name=\''+ aid +'\']');
	$('html,body').animate({scrollTop: aTag.offset().top},'fast');
}

function createNoteEditor(noteId) {
	var noteEditor = new Quill('#noteBody-' + noteId, {
		modules: {
			toolbar: false
		},
		placeholder: 'e.g. THIS IS AN OUTRAGE!',
		theme: 'snow'
	});

	noteEditor.on('text-change', function() {
		$('#noteStatus-' + noteId).addClass('d-none');
		var maxChars = 500;
		if (noteEditor.getLength() > maxChars) {
			noteEditor.deleteText(maxChars, noteEditor.getLength());
		}
	});
}

function doScrape(route) {
	$('#scrapingModal').modal();
	$.ajax(route, {
		method: 'POST'
	}).then(function(response) {
		$('#scrapingModal').modal('hide');
		location.href='/';
	});
}

$(document).ready(function() {
	// checks to see if page was reloaded
	var reloaded;
	if (performance.navigation.type == 1)
		reloaded = true;
	else
		reloaded = false;

	// if page was just scraped with the "scrape" button, scroll 'em down to the articles
	if ($('#scrapeResult').length)
		scrollToAnchor('articles');

	// this ensures that doScrape() won't be called over and over
	var selfReferral = document.referrer.match(/^http(s)?:\/\/(localhost:3000|cryptic-hollows-30966\.herokuapp\.com)(.*)$/);
	if (!selfReferral || reloaded) {
		doScrape('/');
	}

	// if someone clicks the "scrape" button, then... well, do a scrape.
	$('#scrape').on('click', function(event) {
		doScrape('/scrape');
	});

	// turn on tooltips for "delete post" link
	$('[data-toggle="tooltip"]').tooltip();

	// display the comments section for the post
	$('.view-notes').on('click', function() {
		var id = $(this).data('id');
		$('#notes-' + id).toggleClass('d-none');
		createNoteEditor(id);
	});

	$('.new-note').on('click', function() {
		var id = $(this).data('id');
		$('#noteFormWrapper-' + id).toggleClass('d-none');
	});

	$('.note-form').on('submit', function(event) {
		event.preventDefault();
		var articleId = $(this).data('article-id');
		var noteBody = $('#noteBody-' + articleId + ' > .ql-editor');
		var noteName = strip_tags($('#noteName-' + articleId).val().trim());
		$('#noteStatus-' + articleId).addClass('d-none');
		if(noteBody.html() === '<p><br></p>') {
			$('#noteStatus-' + articleId).removeClass('d-none');
			return false;
		}
		
		$.ajax('/articles/' + articleId, {
			type: 'POST',
			data: { 
				name: noteName,
				body: noteBody.html()
			}
		}).then(function(data) {
			noteBody.html('<p><br></p>');
			$('#noteName-' + articleId).val('');
			$('#newNote-' + articleId + ', #notesWrapper-' + articleId).removeClass('d-none');
			$('#noteFormWrapper-' + articleId).addClass('d-none');
			$('#notes-' + articleId + ' > .card.notes-card > .card-body').append('<div id="note-' + data._id + '" class="row note"><div class="col-md-12"><div class="card note-card bg-light mb-3"><div class="card-body"><div class="d-flex w-100 justify-content-between"><h4><small>Note from <strong>' + data.name + '</strong>:</small></h4><a id="delete-' + data._id + '" data-id="' + data._id + '" data-article-id="' + articleId + '" class="delete-note" data-balloon="Shamelessly delete note" data-balloon-pos="left" href="javascript:void(0)"><i class="far fa-trash-alt"></i></a></div>' + data.body + '</div></div></div></div>');
		});
	});

	$('body').on('click', '.delete-note', function() {
		var noteId = $(this).data('id');
		var articleId = $(this).data('article-id');
		$.ajax('/articles/' + articleId + '/' + noteId, {
			type: 'DELETE',
			data: { 
				_id: noteId
			}
		}).then(function(data) {
			$('#note-' + noteId).remove();
			$(this).tooltip('dispose');
			if(!data.notes.length) {
				$('#noteFormWrapper-' + data._id).removeClass('d-none');
				$('#notesWrapper-' + data._id + ', #newNote-' + data._id).addClass('d-none');
			}
		});
	});
});