/* This is part of Calcyte a tool for implementing the DataCrate data packaging
spec.  Copyright (C) 2018  University of Technology Sydney

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

/* Test for collection.js */

const Dspace = require("../lib/dspace.js");
const assert = require("assert");
const fs = require("fs");


describe("Get collection", function() {


  it("We get JSON", function(done) {
    var meta = require("../examples/prs_mani/prs_mani_CATALOG.json")
    var d = new Dspace();
    // Init without special metadata or out put directory
    d.init("https://opus.lib.uts.edu.au/rest", meta);
    assert.equal(d.helper.json_ld["@graph"].length, 4);
    assert.equal(d.helper.root_node.name, "P.R.S. Marni test DataCrate");



    d = new Dspace();
    // Init without special metadata or out put directory
    d.init("https://opus.lib.uts.edu.au/rest");
    const collection_done = _ => {
        assert.equal(d.helper.json_ld["@graph"].length, 37);
        console.log("Finished testing")
      }
    d.get_collection("316", collection_done).then(_ => {
       console.log("Finished collection")
      });
    done();
  });
});



