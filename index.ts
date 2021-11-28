import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import { buildForge } from 'app-builder-lib';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface BuilderTargetConfig {}

type PlatformToBuilderTargetMap = { [name: ForgePlatform]: string };

const platformToBuilderTargetMap: PlatformToBuilderTargetMap = {
    win32: 'nsis-web',
    darwin: 'dmg',
    linux: 'appimage',
};

class MakerBuilderTarget extends MakerBase<BuilderTargetConfig> {
    name = 'custom-builder';

    defaultPlatforms: ForgePlatform[] = ['darwin', 'win32', 'linux'];

    isSupportedOnCurrentPlatform(): boolean {
        return true;
    }

    async make(opts: MakerOptions): Promise<string[]> {
        const builderTarget: string = platformToBuilderTargetMap[opts.targetPlatform];
        const result = await buildForge(opts, { win: [`${builderTarget}:${opts.targetArch}`] });
        const metaFilePath = path.join(opts.makeDir, `${builderTarget}/latest.yml`);
        const archMetaFilePath = path.join(opts.makeDir, `${builderTarget}/latest-${opts.targetArch}.yml`);
        if (fs.existsSync(metaFilePath)) {
            await fsPromises.rename(metaFilePath, archMetaFilePath);
            result.push(archMetaFilePath);
        }
        return result;
    }
}

export default MakerBuilderTarget;
