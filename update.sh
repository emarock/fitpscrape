#!/bin/bash

DATE=$(date +%m%d)

DEBUG=* node getplayers.js > "data/players-$DATE.json" && \
    ln -sf "players-$DATE.json" data/players.json && \
    DEBUG=* node getextra.js > "data/players-ext-$DATE.json" && \
    ln -sf "players-ext-$DATE.json" data/players-ext.json && \
    node detectgen.js > "data/players-ext-gen-$DATE.json" && \
    ln -sf "players-ext-gen-$DATE.json" data/players-ext-gen.json && \
    node data2csv.cjs > "data/players-$DATE.csv"
