/*!
 * damless-mongo
 * Copyright(c) 2021 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * Inspire by https://github.com/nswbmw/qs-mongodb
 * MIT Licensed
 */
const { Error, UndefinedError } = require("oups");
const qs = require("qs");

const logicalOperators = {
  '&&': '$and',
  '||': '$or',
  //'^' : '$nor'
};

/**
 * price>5 => { price: { $gt: 5 }}
 * skip=5 => { skip: 5 }
 * sort[name]=1 => { sort: { name: 1 }}
 */ 
class MongoQueryString {

    constructor(json) {
      this.json = json;
    }

    parse(querystring) {
        if (!querystring) {
            return {
                filter: {}
            };
        }
        
        querystring = this.cancelNullable(querystring);
        querystring = this.formatComparisonOperators(querystring);

        let pathReg;
        while (pathReg = querystring.match(/(^|[^\\])(\(([^(\()]+?)\))/)) { // si (xx) et non pas \(xx\) je remplace le contenu pour les opérations arithmetiques
            querystring = querystring.replace(pathReg[2], this.formatLogicalOperators(pathReg[3]));
        }

        querystring = this.formatLogicalOperators(querystring);
        querystring = this.formatCommaOperators(querystring);
        
        const query = qs.parse(querystring);
        const { skip, limit, sort, project, ...filter } = this.json.typed(query);

        this.validateFilter(filter);
        
        return { filter, skip, limit, sort, project };
    }

    cancelNullable(str) {
      str = str.replace(/([^&=><!]+)[=><!]=?(&|$)/g, ""); //empty regexp ex field=, field>, field<, field>=, field<=, field!=
      str = str.replace(/([^&=]+)=\/\^?\$?\/([ig]*)(&|$)/g, ""); //empty regexp field=//, ..., field=//ig, field=/^/, field=/$/, ...

      return str;
    }

    formatComparisonOperators(str) {
      str = str.replace(/(=?!)(?!=)/g, '[$not]='); //special
      str = str.replace(/=?>=/g, '[$gte]=');
      str = str.replace(/=?<=/g, '[$lte]=');
      str = str.replace(/=?(!=|<>)/g, '[$ne]=');
      str = str.replace(/=?>/g, '[$gt]=');
      str = str.replace(/=?</g, '[$lt]=');

      //regexp with options
      str = str.replace(/([^&\|\(]+)=\/([^&=]+)\/([ig]*)(&|$|\||\))/g, `$1[$regex]=$2&$1[$options]=$3$4`);
      //str = str.replace(/([^&|]+)=\/([^&|]+)\/(\w*)[$|&]/g, `$1[$regex]=$2&$1[$options]=$3`);
      
      return str;
    }
      
    formatLogicalOperators(str) {
      for (let operator in logicalOperators) {
        if (~str.indexOf(operator)) {
          str = str.split(operator).map((item, index) => {
            return item.split('&').map(item => {
              return logicalOperators[operator] + '[' + index + ']' + item.replace(/^([^\[=]+)/, '[$1]');
            }).join('&');
          }).join('&');
          break;
        }
      };
      return str;
    }

    formatCommaOperators(str) {
      if (!str.match(/,/)) return str;
      return str.split('&').map(item => {
        return item.replace(/(.+)=((.+)(,(.+))+)/g, (querystring, p1, p2) => {
          if (p1.match(/\[\$regex\]$/g)) return querystring; // do not split regexp
          return p2.split(',').map((item) => {
            return `${p1}[$in]=${item}`;
          }).join('&');
        });
      }).join('&');
    }
      

    validateFilter(filter) {
        if (!filter) return;
        for (let [k,v] of Object.entries(filter)) {
            if (v instanceof Object) {
                if ("$regex" in v && v.$regex == undefined) delete filter[k];
            }
        }
    }
}

exports = module.exports = MongoQueryString;