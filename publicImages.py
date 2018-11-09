import os
import shutil
import subprocess

sizes = [240, 300, 460, 700, 1040, 2500]

if __name__ == '__main__':
    imagesFolder = f'{os.path.dirname(os.path.abspath(__file__))}/public/images'
    filename = input('Enter filename (without ext): ')
    if os.path.exists(f'{imagesFolder}/{filename}.svg'):
        try:
            os.mkdir(f'{imagesFolder}/{filename}')
        except OSError:
            shutil.rmtree(f'{imagesFolder}/{filename}', True)
        for size in sizes:
            subprocess.call(['inkscape', '-z', '-e', f'{imagesFolder}/{filename}/{size}.png', '-w', str(size), f'{imagesFolder}/{filename}.svg'])
    else:
        print('ファイルが見つかりません')
