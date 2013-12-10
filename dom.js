var $dom = function $dom () {};

$dom.prototype.each = function $dom_each (list,callback) {

    var itr,item,len,item;

    len = list.length;
    
    for (itr = 0; itr < len; itr += 1) {

        item = list[itr];

        callback.call(null,item);
        
    }
}

$dom.prototype.el = function $dom_el (tag,options) {
    "use strict";
    var elements,p,attrs,props,events;
    
    if (tag instanceof HTMLElement) {
        elements = [tag];
    } else if (tag instanceof Array) {
        elements = tag;
    } else if (typeof tag === "string") {
        if (/<\w+>/.test(tag)) {
            try {
                elements = [document.createElement(tag.replace(/[<>]/g,'').trim())];
            } catch (err) {
                throw TypeError("$dom.el_document.createElement: needs a valid tag");
            }
        } else {
            elements = document.querySelectorAll(tag);
            if (!(elements instanceof NodeList)) {
                return undefined;
            }
        }
    } else {
        throw TypeError();
        return;
    }
    if (options) {
    this.each(elements,function $dom_el_elements_each (element) {
        
            if (options.attrs) {
                attrs = options.attrs;
                for (p in attrs)  {
                    if (attrs.hasOwnProperty(p)) {
                        element.setAttribute(p,attrs[p]);
                    }
                }
            }
            if (options.props) {
                props = options.props;
                for (p in props) {
                    if (props.hasOwnProperty(p)) {
                        element[p] = props[p];
                    }
                }
            }
            if (options.events) {
                events = options.events;
                for (p in events) {
                    if (events.hasOwnProperty(p)) {
                        if (typeof events[p] === 'function') {
                            element.addEventListener(p,events[p],false);
                        } else {
                            throw TypeError("$dom.el: events need to be of type 'function'");
                            
                        }
                    }
                }
            }
       
        });
    }
    if (elements.length > 1) {
        return elements;
    } else {
        return elements[0];
    }
    
};
$dom.prototype.query = function $dom_query (element, queryObject) { "use strict";
    var results,
    propertyKey,property,
    queryKey,query,
    stdQueryFunc;
    
    stdQueryFunc = function stdQueryFunc (x) { "use strict";
        return x;
    }
    results = {};
    
    if(element instanceof HTMLElement && typeof queryObject === "object") {
        for (queryKey in queryObject) {
            if (queryObject.hasOwnProperty(queryKey)) {
                // what to do.
                if (element[queryKey]) {
                    results[queryKey] = stdQueryFunc(element[queryKey]);
                }
            }
        }
        return results;
    } else {
        throw TypeError();
    }
};
$dom.prototype.script = function $dom_script (id,type,src,callback) { "use strict";
    var script,types,scriptObj;
    
    types = {
        inline: "text/plain",
        template: "text/template",
        javascript: "application/javascript",
    }
    
    script = this.el('<script>');
    
    script.setAttribute("id",id);
    script.setAttribute("type",types[type] || types["inline"]);
    
    if (/^(https{0,1}|ftp):\/\//.test(src)) {
        
        script.addEventListener('load',function $dom_script_load (event) { "use strict";
            script.removeEventListener('load',$dom_script_load,false); 
            if (typeof callback === 'function') {
                callback.call(null,false,script);
            }
            });
        script.addEventListener('error',function $dom_script_error (event) {"use strict";
            script.removeEventListener('error',$dom_script_error,false);
            if (typeof callback === 'function') {
                callback.call(null,true,event);
            }
            });
        script.setAttribute("src",src);
        document.head.appendChild(script);
    } else {
        script.innerHTML = src;
        document.head.appendChild(script);
        callback.call(null,true,script);
    }
};

$dom.prototype.workerLocal = function $dom_workerLocal (elID,options,callback) {
    var el,objURL,worker;
    options = options || {};
    
    if (!window.URL.createObjectURL) {
        throw Error("$dom.workerLocal - window.URL.createObjectURL: does not exist.");
    }
    el = this.el(elID);
    if (el) {
       try {
           worker = new Worker(window.URL.createObjectURL(new Blob([el.innerText])));   
       } catch (err) {
           //console.error(err);
        throw Error("$dom.workerLocal - Could not create worker from: " +elID);  
       }
       if (worker instanceof Worker) {
           
           if (options.hasOwnProperty("onmessage")) {
              
               if (typeof options.onmessage === 'function') {
                   worker.addEventListener('message',options.onmessage,false);
                   if (options.initMessage) {
                       worker.postMessage(options.initMessage);
                   }
               }
           }
       }
    }
    if ('function' === typeof callback) {
        callback.call(null,worker);
    }
    return worker;
};

$d = new $dom;
