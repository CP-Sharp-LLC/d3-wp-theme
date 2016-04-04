/* globals cp, App, Logocolor, singlepost */
cp.addready( App.Map.UI, function () {
	setTimeout(function() {
		var data = JSON.parse( singlepost.postdata );
		App.Map.UI.shuttle( data );
	}, 500);
});