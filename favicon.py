import os
import subprocess

sizes = [16, 24, 32, 48, 57, 64, 76, 96, 120, 128, 144, 152, 180, 192, 195, 196, 228, 270, 512]

if __name__ == '__main__':
    publicFolder = f'{os.path.dirname(os.path.abspath(__file__))}/public'
    filePath = f'{publicFolder}/icon.svg'
    if os.path.exists(filePath):
        os.mkdir(f'{publicFolder}/icons')
        for size in sizes:
            subprocess.call(['inkscape', '-z', '-e', f'{publicFolder}/icons/{size}.png', '-w', str(size), filePath])
    else:
        print('ファイルが見つかりません')
