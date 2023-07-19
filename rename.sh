#!/bin/bash

# Change directories
find . -type d -name '*calckey*' | while read dir; do
    newdir=$(echo "$dir" | perl -pe 's/calckey/firefish/g')
    mv "$dir" "$newdir"
done

# Change files
find . -type f -name '*calckey*' | while read file; do
    newfile=$(echo "$file" | perl -pe 's/calckey/firefish/g')
    mv "$file" "$newfile"
done
