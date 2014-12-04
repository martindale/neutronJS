var bp = require("body-parser");
var DateType = require("../types/date");
var StringType = require("../types/string");


function List(id,opts){
    this.id = id;
    this.label = opts.label||id;
    this.defaultSort = opts.defaultSort||[];
    this.columns = {};   
}

List.prototype.add = function(columns){
    for(var column in columns){
        var col = columns[column];
        this.columns[column] = col;
        switch(col.type){
            case String:
                col.type = StringType;
                break;
            case Date:
                col.type = DateType;
                break;
        }
    }
}

List.prototype.init = function(website,router){
    var self = this;
    router.post("/query",bp.json(),function(req,res){
        var query = {};
        if(typeof req.body.search == "string"){
            var search = [];
            for(var name in self.columns){
                var col = self.columns[name];
                if(col.search){
                    var q = {};
                    q[name] = {$regex:req.body.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),$options:"i"}
                    search.push(q)
                }
            }
            if(search.length) query.$or = search;            
        }
        website.db.collection(self.id).find(query).toArray(function(err,items){
            res.writeHead(200,"OK",{"Content-Type":"application/json"});
            res.end(JSON.stringify(items||[]));
        });       
    });
    router.get("/:id",function(req,res){
        
    });
    router.post("/:id",function(req,res){
        
    });
    
    var columns = {};
    for(var name in this.columns){
        var column = this.columns[name];
        website.ensureType(column.type);
        columns[name] = {type:column.type.id}
        if(column.default) columns[name].visible = true;
    }
    
    this.properties = {
        defaultSort:this.defaultSort,
        columns:columns
    }
}

List.prototype.componentPath = require.resolve("./list.jade");
module.exports = List;