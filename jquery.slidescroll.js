/*! Copyright (c) 2013 Florian Pichler <pichfl@einserver.de>
 * Licensed under the MIT License
 *
 * Version: 1.2.0
 *
 * Slidescroll is a jQuery plugin inspired by Apple's product page for the iPhone 5s
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['.'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS style for Browserify
		module.exports = factory;
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	var win = window,
		$win = $(win),
		doc = document,
		$doc = $(doc),
		$html = $(doc.documentElement);

	/**
	 * Slidescroll class
	 *
	 * @param element a selector or dom element used as base
	 * @param options an object which overwrites the class defaults
	 * @constructor
	 */
	var Slidescroll = function (element, options) {
		this.$element = $(element);
		this.options = $.extend({}, Slidescroll.DEFAULTS, options);
		this.navigationEnabled = false;
		this.enabled = false;

		this.enable();
	};

	// The default options
	Slidescroll.DEFAULTS = {
		pagesSelector: '> *',
		css3: win.Modernizr.csstransforms3d,
		initialPage: 0,
		generateNavigation: true,
		activeClassName: 'active',
		moved: null,
		beforemove: null,
		animationDuration: 1000,
		namespace: 'slidescroll'
	};

	/**
	 * Builds and adjusts the dom
	 */
	Slidescroll.prototype.build = function () {
		this.addClass($html, 'enabled');

		this.$pages.each(function (index, item) {
			var $item = $(item);
			var id = $item.attr('id');
			var titleSelector = $item.data(this.options.namespace+'-title-selector');
			var titleData = $item.data(this.options.namespace+'-title');
			var pageUrl = id || $item.data(this.options.namespace+'-url');

			if (id) {
				$item.data(this.options.namespace+'-id', id);
				$item.removeAttr('id');
			}

			// Position item for slide effect
			$item.css({
				'top': '' + (100 * index) + '%'
			});

			// Add or create page-key (used for hash navigation)
			var key = 'page-' + index;

			if (titleSelector) {
				key = encodeURI(titleSelector);
			}
			if (pageUrl) {
				key = pageUrl;
			}

			this.pageKeys[index] = key;

			// Prepare Navigation
			if (this.options.generateNavigation) {
				var el = $('<a />');
				var title = ['<span class="index">', index + 1, '</span>'];

				if (titleData || titleSelector) {
					$.merge(title, [
						' <span class="title">',
						titleData || $item.find(titleSelector).first().text(),
						'</span>'
					]);
				}

				el.html(title.join(''));
				el.data('target-slide', index);
				el.attr('href', '#' + key);

				if (index === this.current) {
					el.addClass(this.options.activeClassName);
				}

				this.$nav.append(el);
			}
		}.bind(this));

		if (this.options.generateNavigation && !this.navigationEnabled) {
			this.$navItems = this.$nav.children();
			this.$element.after(this.$nav);

			this.navigationEnabled = true;
		}

		// Init hash
		this.current = this.validIndex(this.hash());
		this.show(this.current);
	};

	/**
	 * Undo's the build() function, effectively disabling the plugin.
	 */
	Slidescroll.prototype.teardown = function () {
		this.removeClass($html, 'enabled');

		this.$pages.each(function (index, item) {
			var $item = $(item);
			var dataId = $item.data(this.options.namespace+'-id');

			$item.removeAttr('style');

			if ( dataId ) {
				$item.attr('id', dataId);
			}

			this.removeClass($html, this.pageKeys[index]);
		}.bind(this));

		if (this.options.generateNavigation) {
			this.$nav.remove();
			this.navigationEnabled = false;
		}

		this.$element.removeAttr('style');

		this.removeClass($html, 'transitioning');

		// Init hash
		this.current = this.validIndex(this.hash());
	};

	/**
	 * Attach all event handlers
	 */
	Slidescroll.prototype.attach = function () {
		$doc.on({
			'keydown.slidescroll': function (event) {
				var tag = event.target.tagName.toLowerCase();

				if (tag !== 'input' && tag !== 'textarea') {
					var key = event.keyCode;
					var shift = event.shiftKey;

					if ((key === 32 && !shift) || key === 40) {
						this.showNext();
						event.preventDefault();
					} else if ((key === 32 && shift) || key === 38) {
						this.showPrevious();
						event.preventDefault();
					} else if (key === 36) {
						this.showFirst();
						event.preventDefault();
					} else if (key === 35) {
						this.showLast();
						event.preventDefault();
					}
				}
			}.bind(this)
		});

		// Enable scrolling, requires jquery.mousewheel
		if ($.fn.mousewheel) {
			var ago;

			$win.on({
				'mousewheel.slidescroll': function (event, delta, deltaX, deltaY) {
					var now = new Date().getTime();
					// adding 500 to prevent the MacBook momentum from scrolling twice
					if (now - ago < this.options.animationDuration + 500) {
						event.preventDefault();
						return;
					}

					var fn = 'show' + ((delta > 0) ? 'Previous' : 'Next');
					this[fn].apply(this);

					ago = now;
				}.bind(this)
			});
		}

		// Enable Touch
		var startY;

		var touchmove = function (event) {
			event.preventDefault();

			var touches = event.originalEvent.touches;
			if (touches && touches.length) {
				var deltaY = startY - touches[0].pageY;

				if (deltaY >= 50) {
					this.showNext();
				}
				if (deltaY <= -50) {
					this.showPrevious();
				}
				if (Math.abs(deltaY) >= 50) {
					$win.off('touchmove.slidescroll', touchmove);
				}
			}
		}.bind(this);

		$win.on({
			'touchstart.slidescroll': function (event) {
				event.preventDefault();

				var touches = event.originalEvent.touches;
				if (touches && touches.length) {
					startY = touches[0].pageY;
					$win.on('touchmove.slidescroll', touchmove);
				}
			}.bind(this)
		});

		// Enable callback after each transition
		this.$element.on({
			'webkitTransitionEnd.slidescroll otransitionend.slidescroll oTransitionEnd.slidescroll msTransitionEnd.slidescroll transitionend.slidescroll': function () {
				this.removeClass($html, 'transitioning');

				if ($.type(this.options.moved) === 'function') {
					this.options.moved.apply(this, [
						this.current,
						this.pageKeys[this.current]
					]);
				}
			}.bind(this)
		});

		$win.on({
			'hashchange.slidescroll': this.changedHash.bind(this)
		});
	};

	/**
	 * Disables all callbacks create for this plugin
	 */
	Slidescroll.prototype.detach = function () {
		$doc.off('.slidescroll');
		$win.off('.slidescroll');
		this.$element.off('.slidescroll');
	};

	/**
	 * Enable the plugin
	 * @returns {Slidescroll}
	 */
	Slidescroll.prototype.enable = function () {
		if (!this.enabled) {

			if (this.$nav) {
				this.$nav.empty();
			} else {
				this.$nav = $('<nav role="navigation" class="'+this.options.namespace+'-nav" />');
			}

			this.$pages = this.$element.find(this.options.pagesSelector);
			this.$navItems = $();
			this.pageKeys = [];

			var initialPageData = this.$element.data(this.options.namespace+'-initial-page');
			if ($.type(initialPageData) === 'number') {
				this.options.initialPage = initialPageData;
			}

			this.current = this.options.initialPage;

			this.build();
			this.attach();

			this.enabled = true;
		}

		return this;
	};

	/**
	 * Disable the plugin, removing all of it's effects
	 * @returns {Slidescroll} the disabled instance
	 */
	Slidescroll.prototype.disable = function () {
		if (this.enabled) {
			this.teardown();
			this.detach();

			this.enabled = false;
		}

		return this;
	};

	/**
	 * Maps a passed key to it's index and checks for availability
	 *
	 * @param indexOrKey
	 * @returns int index
	 */
	Slidescroll.prototype.validIndex = function (indexOrKey) {
		var index = $.inArray(indexOrKey, this.pageKeys);

		if ($.type(indexOrKey) === 'string' && index) {
			return index;
		} else if (indexOrKey < this.$pages.length && indexOrKey >= 0) {
			return indexOrKey;
		}

		return 0;
	};

	/**
	 * Show a page by index or key (validated)
	 * @param indexOrKey string or int
	 */
	Slidescroll.prototype.show = function (indexOrKey) {
		var index = this.validIndex(indexOrKey);

		// Remove current class
		this.removeClass($html, this.pageKeys[this.current]);
		this.addClass($html, this.pageKeys[index]);
		this.addClass($html, 'transitioning');

		if ($.type(this.options.beforemove) === 'function') {
			this.options.beforemove.apply(this, [
				this.current,
				index
			]);
		}

		this.$navItems.removeClass(this.options.activeClassName);
		this.$navItems.eq(index).addClass(this.options.activeClassName);

		if (this.options.css3) {
			this.$element.css('transform', 'translate3d(0,' + (-100 * index) + '%,0)');
		} else {
			this.$element.css('top', '' + (-100 * index) + '%');
		}

		this.hash(index);
		this.current = index;
	};

	/**
	 * Show first page
	 */
	Slidescroll.prototype.showFirst = function () {
		this.show(0);
	};

	/**
	 * Show last page
	 */
	Slidescroll.prototype.showLast = function () {
		this.show(this.$pages.length - 1);
	};

	/**
	 * Show page after current page, if it exists
	 */
	Slidescroll.prototype.showNext = function () {
		var next = this.current + 1;
		if (next >= this.$pages.length) {
			next = this.$pages.length - 1;
		}
		this.show(next);
	};

	/**
	 * Show page before current page, if it exists
	 */
	Slidescroll.prototype.showPrevious = function () {
		this.show(this.current - 1);
	};

	/**
	 * Sets the location hash to either the passed string or
	 * the string stored for the passed index
	 *
	 * If param is left empty returns the current hash
	 *
	 * @param newHash string or integer
	 */
	Slidescroll.prototype.hash = function (newHash) {
		if (newHash === undefined) {
			return win.location.hash.substr(1);
		} else {
			if ($.type(newHash) === 'number') {
				newHash = this.pageKeys[newHash];
			}
			win.location.hash = newHash;
			return this;
		}
	};

	/**
	 * Callback for the global hash change event
	 * Tries to find and navigate to the page specified by the new hash
	 *
	 * @param event
	 */
	Slidescroll.prototype.changedHash = function (event) {
		var newIndex = $.inArray(this.hash(), this.pageKeys);
		if (newIndex !== -1 && this.pageKeys[newIndex] !== this.pageKeys[this.current]) {
			this.show(newIndex);
		}
	};

	/**
	 * Namespaced variant of $.addClass
	 *
	 * @param className
	 */
	Slidescroll.prototype.addClass = function (el, className) {
		$(el).addClass(this.options.namespace + '-' + className);
	};

	/**
	 * Namespaced variant of $.removeClass
	 *
	 * @param el
	 * @param className
	 */
	Slidescroll.prototype.removeClass = function (el, className) {
		$(el).removeClass(this.options.namespace + '-' + className);
	};

	// Store previous for no conflict handling
	var old = $.fn.slidescroll;

	// Plugin definition
	$.fn.slidescroll = function (option) {
		return this.each(function () {
			var $this = $(this);
			var data = $this.data('slidescroll');
			var options = $.extend({}, Slidescroll.DEFAULTS, $this.data(), typeof option === 'object' && option);

			if (!data) {
				$this.data('slidescroll', (data = new Slidescroll(this, options)));
			}
		});
	};

	$.fn.slidescroll.Constructor = Slidescroll;

	// No conflict support
	$.fn.slidescroll.noConflict = function () {
		$.fn.slidescroll = old;
		return this;
	};

}));
