var Linkify = (function (React, linkifyjs) {
	'use strict';

	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		}
		n["default"] = e;
		return Object.freeze(n);
	}

	var React__namespace = /*#__PURE__*/_interopNamespace(React);

	/**
	 * Given a string, converts to an array of valid React components
	 * (which may include strings)
	 * @param {string} str
	 * @param {Options} opts
	 * @param {{ [elementId: string]: number }} meta
	 * @returns {React.ReactNodeArray}
	 */

	function stringToElements(str, opts, meta) {
	  var tokens = linkifyjs.tokenize(str);
	  var elements = [];

	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i];

	    if (token.t === 'nl' && opts.get('nl2br')) {
	      var key = "__linkify-el-" + meta.elementId++;
	      elements.push(React__namespace.createElement('br', {
	        key: key
	      }));
	    } else if (!token.isLink || !opts.check(token)) {
	      // Regular text
	      elements.push(token.toString());
	    } else {
	      var rendered = opts.render(token);

	      if (!('key' in rendered.props)) {
	        // Ensure generated element has unique key
	        var _key = "__linkify-el-" + meta.elementId++;

	        var props = linkifyjs.options.assign({
	          key: _key
	        }, rendered.props);
	        rendered = React__namespace.cloneElement(rendered, props);
	      }

	      elements.push(rendered);
	    }
	  }

	  return elements;
	} // Recursively linkify the contents of the given React Element instance

	/**
	 * @template P
	 * @template {string | React.JSXElementConstructor<P>} T
	 * @param {React.ReactElement<P, T>} element
	 * @param {Options} opts
	 * @param {{ [elementId: string]: number }} meta
	 * @returns {React.ReactElement<P, T>}
	 */


	function linkifyReactElement(element, opts, meta) {
	  if (React__namespace.Children.count(element.props.children) === 0) {
	    // No need to clone if the element had no children
	    return element;
	  }

	  var children = [];
	  React__namespace.Children.forEach(element.props.children, function (child) {
	    if (typeof child === 'string') {
	      // ensure that we always generate unique element IDs for keys
	      children.push.apply(children, stringToElements(child, opts, meta));
	    } else if (React__namespace.isValidElement(child)) {
	      if (typeof child.type === 'string' && opts.ignoreTags.indexOf(child.type.toUpperCase()) >= 0) {
	        // Don't linkify this element
	        children.push(child);
	      } else {
	        children.push(linkifyReactElement(child, opts, meta));
	      }
	    } else {
	      // Unknown element type, just push
	      children.push(child);
	    }
	  }); // Set a default unique key, copy over remaining props

	  var key = "__linkify-el-" + meta.elementId++;
	  var newProps = linkifyjs.options.assign({
	    key: key
	  }, element.props);
	  return React__namespace.cloneElement(element, newProps, children);
	}
	/**
	 * @template P
	 * @template {string | React.JSXElementConstructor<P>} T
	 * @param {P & { as?: T, tagName?: T, tagName?: T, options?: import('linkifyjs').Opts, children?: React.ReactNode}} props
	 * @returns {React.ReactElement<P, T>}
	 */


	var Linkify = function Linkify(props) {
	  // Copy over all non-linkify-specific props
	  var linkId = 0;

	  var defaultLinkRender = function defaultLinkRender(_ref) {
	    var tagName = _ref.tagName,
	        attributes = _ref.attributes,
	        content = _ref.content;
	    attributes.key = "__linkify-lnk-" + linkId++;

	    if (attributes.class) {
	      attributes.className = attributes.class;
	      delete attributes.class;
	    }

	    return React__namespace.createElement(tagName, attributes, content);
	  };

	  var newProps = {
	    key: '__linkify-wrapper'
	  };

	  for (var prop in props) {
	    if (prop !== 'options' && prop !== 'as' && prop !== 'tagName' && prop !== 'children') {
	      newProps[prop] = props[prop];
	    }
	  }

	  var opts = new linkifyjs.Options(props.options, defaultLinkRender);
	  var as = props.as || props.tagName || React__namespace.Fragment || 'span';
	  var children = props.children;
	  var element = React__namespace.createElement(as, newProps, children);
	  return linkifyReactElement(element, opts, {
	    elementId: 0
	  });
	};

	return Linkify;

})(React, linkify);
