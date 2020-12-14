/**
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2020 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
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