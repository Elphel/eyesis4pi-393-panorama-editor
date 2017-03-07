function jquery_list(list, msg) {
    var selectBoxContainer = $("#"+list);

    //add the header box <div> to the list
    selectBoxContainer.append("<div></div>");

    //assign the default message to the list header
    var selectBox = selectBoxContainer.find('div');
            
    selectBox.html(msg);
    selectBoxContainer.attr('value',msg);
    
    //process the list 
    var dropDown = selectBoxContainer.find('ul');
    //dropDown.css({position:'absolute'});

    selectBoxContainer.append(dropDown.hide());

    dropDown.bind('show',function(){

	if(dropDown.is(':animated')){
	    return false;
	}

	selectBox.addClass('expanded');
	dropDown.slideDown();

    }).bind('hide',function(){

	if(dropDown.is(':animated')){
	    return false;
	}

	selectBox.removeClass('expanded');
	dropDown.slideUp();

    }).bind('toggle',function(){
	if(selectBox.hasClass('expanded')){
	    dropDown.trigger('hide');
	}
	else dropDown.trigger('show');
    });

    selectBox.click(function(){
	dropDown.trigger('toggle');
	return false;
    });

    $(document).click(function(){
	dropDown.trigger('hide');
    });

    //process all the list elements
    dropDown.find('li').each(function(i) {      
	var li = $(this);

	li.click(function(){
	    selectBox.html(li.html());
	    selectBoxContainer.attr('value',li.html());
	    dropDown.trigger('hide');
	    return false;
	});
    });
    
}