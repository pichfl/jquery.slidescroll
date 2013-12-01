jQuery Slidescroll
==================

A [jQuery](http://jquery.com) plugin inspired by Apple's [product page](http://www.apple.com/iphone-5s/) for the iPhone 5s

My version of this feature supports scroll, touch and keyboard navigation. It also allows to specify callbacks which are executed before and after a page change. The current page is also stored into and read from window.location.hash.

It is highly recommend to use this plugin with care and remember to provide a proper fallback for scenarios without JavaScript.


Requirements
------------

- jQuery
- [jQuery-mousewheel](https://github.com/brandonaaron/jquery-mousewheel)

If you install this plugin via [Bower](http://bower.io), all dependencies will be resolved automatically.


Usage
-----

Add the plugin and it's dependencies to your page.

```js
// Init the plugin on your container element.

$('.wrapper').slidescroll({
	pagesSelector: '.page'
});

```


Options
-------

This plugin somehow managed to get quite a few options which can be set when initializing.
Some options can also be set by added data-*-attributes to the element the plugin is initialized on.

<dl>
	<dt>pagesSelector</dt>
	<dd><em>Defaults to <code>> *</code>.</em> Should be set to something a little more specific if possible</dd>

	<dt>css3</dt>
	<dd>Enable the use of CSS3 transforms instead of relative positioning for smoother performance on most devices. Defaults to the result of the corresponding Modernizr-check. If you don't include Modernizr remember to set this directly or to your own detection method.</dd>

	<dt>initialPage</dt>
	<dd>Also available as data-attribute <code>slidescroll-initial-page</code>. Allows you to set the page loaded on startup. Please note that the location.hash will override this setting.</dd>

	<dt>generateNavigation</dt>
	<dd><em>Defaults to true.</em> Generates a simple navigation for the available pages.</dd>

	<dt>activeClassName</dt>
	<dd>Defines the className used for the active element in the generated navigation</dd>

	<dt>beforemove</dt>
	<dd>A callback executed before the transition to the next page is started. It's Bound to the current instance and the current and next page index are passed as parameters</dd>

	<dt>moved</dt>
	<dd>A callback executed after the transition is complete. It's Bound to the current instance and the resulting current page index is passed as parameter.</dd>

	<dt>animationDuration</dt>
	<dd>The animation duration should be set to the same value used in the css file.</dd>

	<dt>namespace</dt>
	<dd><em>Defaults to <code> slidescroll</code>.</em> Adjust the prefix used for CSS classNames and data-attribute prefixes</dd>
</dl>

### Generated Navigation

To enhance the generated navigation, you can add some data-attributes to the page elements.

- `data-slidescroll-title` will set the title of the page
- `data-slidescroll-title-selector` will read the title of the page from the given selector and overrides the above
- `data-slidescroll-url` sets the string used for the url hash. If not defined, the plugin will try to generate a string either from the title (see above) or generate a generic one


Version History
---------------

- **1.2.0** Replaced `data-slidescroll-url` with `id` attribute for a lazier fallback when disabling the plugin. The previous behaviour is still available.
- **1.1.2** Added lock for enable/disable functions
- **1.1.1-2** Fixed problems with root element class and duplicated navigation
- **1.1.1** Made the styling depend on a class of the HTML element for easier styling when disabled
- **1.1.0** Added disable() function to disable the plugin. re-enable with with enable();
- **1.0.1** Added fix for scroll momentum
- **1.0.0** Initial release


Credits
-------

- Apple: For the great design and inspiration
- [Pete R. / peachananr](https://github.com/peachananr/onepage-scroll/) who wrote a similar plugin which didn't match my expectations and made me write this plugin


License
-------

MIT, See LICENSE file.


Contact
-------

- Twitter: [@pichfl](http://twitter.com/pichfl)
- Web (you can find my email and other information there): [florianpichler.de](http://florianpichler.de)
