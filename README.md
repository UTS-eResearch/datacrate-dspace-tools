# datacrate-dspace-tools


Nodejs tools for extracting data from DSpace repositories into DataCrate format. 

This repository is for tools similar to the [DataCrate Omeka tools](https://github.com/UTS-eResearch/omeka-datacrate-tools) for the DSpace repository, but written in Node. Development will start with a DSpace collection to DataCrate script.

NOTE: This is very early in development, it has been written around a single collection, but if and when we use it more we'll add more features.

See an [example of the output from the this script](https://data.research.uts.edu.au/examples/v1.0/prs_mani/) run on [this collection](https://opus.lib.uts.edu.au/handle/10453/28084).

## Audience


This script is suitable for use by Nodejs developers only, it is _not_ production ready and will need to be adapted for use on new data sources. Contributions welcome!

## Installation

- Install [node.js](https://nodejs.org/en/). This will also install the nodejs part of [CalcyteJS](https://code.research.uts.edu.au/eresearch/CalcyteJS) a command line tool for manipulating DataCrates.

- Get the code:
  git clone https://code.research.uts.edu.au/eresearch/datacrate-dspace-tools.git

- Link the binary for development. Type:
  npm link

## Usage

```
./download_dspace --help

  Usage: download_dspace [options] <endpoint>

  Generates DataCrate HTML from a DSpace instance.

  Options:

    -V, --version                      output the version number
    -c,  --collection [collection-id]  Dowlnoad collection by ID
    -d,  --depth                       Maximum depth to recurse into directories
    -m, --metadata [metadata-file]     Metadata for the DataCrate
    -o, --output_dir []                Output directory
    -h, --help                         output usage information
```

## Example

To produce the output in the [example](https://data.research.uts.edu.au/examples/v1.0/prs_mani/), type:
```
mkdir ~/working/prs_mani # Create a dir
./download_dspace -c 316  -m examples/prs_mani/prs_mani_CATALOG.json  -o ~/working/prs_mani https://opus.lib.uts.edu.au/rest
calcyte -o ~/working/prs_mani
```



