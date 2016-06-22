# ecloud-generate package
# EC Framework Generate

###2016-06-22
####V1.0
quick generate Controller and View,and auto require View path


###key map
control + option + g : input your ControllerName and press enter

###example
ControllerName : PageTest

#####file_tree
	Controller
	|__page_test.coffee
	|
	View
	|__page_test.coffee

ControllerName : NameSpace::PageTest

#####file_tree
	Controller
	|__name_space
	        |_page_test.coffee
	|
	View
	|__name_space
		    |_page_test.coffee