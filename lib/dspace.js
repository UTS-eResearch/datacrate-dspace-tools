/* This is part of datacrate-dspace-tools a tool for extracting data from DSpace
into the DataCrate data packaging spec. Copyright (C) 2018 University of
Technology Sydney

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// From here:
const axios = require("axios")
calcyte = require("calcyte")
const fs = require("fs")
const shell = require("shelljs")
const path = require("path")
const extra_context = {

}
   
const map_keys = {
    "dc.title": "name",
    "dc.subject": "about",
    "dc.contributor.author": "creator",
    "dc.contributor": "author",
    "dc.date.accessioned": "date"   
}

function get_id(item) {
    return item.handle ? item.handle : item.id;
}

module.exports = function () {
    return {
    init: function(endpoint_url, metadata, out_dir){
        this.endpoint_url = endpoint_url;
        this.out_dir = out_dir ? out_dir : '.';
        this.axios_instance = axios.create({
            baseURL: endpoint_url,
            timeout: 10000,
            headers: {'Accept': 'application/json'}
          });
          
          this.json_ld = metadata ? metadata :
               {"@graph": [{"@id": "none", path: "./", "name": "Nothing", "hasMember": [], "@type": "Dataset"}]};
          this.helper = new calcyte.jsonld();   
          this.helper.init(this.json_ld)      
    },
    get_collection: function(collection_id, done){
       return this.axios_instance("/collections/" + collection_id + "?expand=all").then(response => {  
           var this_collection = response.data;
           var id =  get_id(this_collection)
           var collection = {'@id': `${id}`, 
                             hasMember: [], 
                             "name": this_collection.name,
                             "description": this_collection.introductoryText,
                             "@type": ["RepositoryCollection"]};
           this.helper.root_node.hasMember.push({'@id': `${id}`});
           var promises = [];
           for (item of this_collection.items) {
               promises.push(this.get_item(item.id,  collection.hasMember))
           }
           Promise.all(promises).then(responses => {
            this.helper.json_ld["@graph"].push(collection);
            this.helper.init(this.json_ld);
            this.helper.trim_context();
            done();


         }).catch(function(reason) {
            // catch all the errors
            console.log(reason);
         });
      
    })},

    item_from_api_json: function(item, type) {
        var id = get_id(item);
        var new_item = {"@id": `${id}`, "@type": type, "hasFile": []}  
              for (let meta_item of item.metadata) {
                if (map_keys[meta_item["key"]]) {
                    new_item[map_keys[meta_item["key"]]] = meta_item["value"]
                }
            }
        return new_item;
    },
    /*
      { id: 486412,
       name: 'license.txt',
       handle: null,
       type: 'bitstream',
       link: '/rest/bitstreams/486412',
       expand: [Array],
       bundleName: 'LICENSE',
       description: null,
       format: 'License',
       mimeType: 'text/plain',
       sizeBytes: 448,
       parentObject: null,
       retrieveLink: '/bitstreams/486412/retrieve',
       checkSum: [Object],
       sequenceId: 2,
       policies: null }
    */
    get_bitstreams: function(bitstreams, item) {
        promises = []
        for (let stream of bitstreams){
            var new_file = {
                "@id": `${stream.id}`,
                "@type": "File",
                "name": `${stream.name}`,
                "contentSize": `${stream.sizeBytes}`,
                "encodingFormat": `${stream.format}`,
                "path": `files/${stream.id}/${stream.name}`
            }
            this.json_ld["@graph"].push(new_file)
            item.hasFile.push({"@id": `${stream.id}`})
            

            promises.push(this.download_stream(new_file,stream.retrieveLink))
            
            Promise.all(promises).then(responses => {
                console.log(".")
            })}
        
    },
    download_stream: function(new_file, url){
        return this.axios_instance({
            method: 'GET',
            url: url,
            responseType: 'stream'
          }).then(response => {
            var out_path = path.join(this.out_dir, new_file.path);
            shell.mkdir('-p', path.dirname(out_path));
            console.log("Writing", out_path);
            response.data.pipe(fs.createWriteStream(out_path));
          })
    },
    get_item: function get_item(item_id, member_list){
        return this.axios_instance("/items/" + item_id + "?expand=all").then(response => {  
            var item = response.data;
            var new_item = this.item_from_api_json(item, "RepositoryObject");
            this.json_ld["@graph"].push(new_item);
            member_list.push({"@id": `${get_id(item)}`});
            this.get_bitstreams(item.bitstreams, new_item);
            });
    }
};
}

