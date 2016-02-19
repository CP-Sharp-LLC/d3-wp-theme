jQuery('#chanceSlider').on('change', function(){
    jQuery('#chance').val(jQuery('#chanceSlider').val());
});

jQuery('#chance').on('keyup', function(){
    jQuery('#chanceSlider').val(jQuery('#chance').val());
});