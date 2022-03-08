/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

"use strict";

const fs = require("fs").promises;
const { basename } = require("path");

class AioLibFilesMock {

    async copy(srcPath, destPath, options) {
        if (!srcPath || !destPath) {
            throw Error(`srcPath and destPath must be provided: ${srcPath}, ${destPath}, ${options}`);
        } else if (!options || options.localSrc || !options.localDest ) {
            throw Error("copy only from source in cloud storage to local file");
        }
        await fs.writeFile(destPath, "success\n", "utf8");
    }

    async generatePresignURL(path, options) {
        const ttl = options.expiryInSeconds || 300;
        const permissions = options.permissions || "r";
        return `https://www.azureedge.net/${ttl}/${permissions}/${basename(path)}`;
    }

    async delete() {
        console.log("AioLibFilesMock.delete called");
    }

}

module.exports = {
    AioLibFilesMock
};