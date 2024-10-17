import os

# Текущая директория
current_directory = os.getcwd()

# Имя выходного файла
output_file = 'ts_tsx_css_files_with_code.txt'

# Открываем файл для записи
with open(output_file, 'w', encoding='utf-8') as output:
    # Проходим по всем файлам и директориям в текущей папке и подпапках
    for root, dirs, files in os.walk(current_directory):
        for filename in files:
            if filename.endswith('.ts') or filename.endswith('.tsx') or filename.endswith('.css'):
                # Полное имя файла без пути
                # file_path = os.path.join(root, filename)  # Старый вариант

                # Записываем только название файла в текстовый файл
                output.write(f'File: {filename}\n')

                # Полный путь к файлу для чтения содержимого
                file_path = os.path.join(root, filename)
                
                # Открываем файл и записываем его содержимое
                try:
                    with open(file_path, 'r', encoding='utf-8') as file:
                        code = file.read()
                        output.write(code + '\n\n')  # Добавляем пустую строку между файлами
                except Exception as e:
                    output.write(f'Не удалось прочитать файл {filename}: {e}\n\n')

print(f'Код всех файлов .ts, .tsx и .css записан в {output_file}')
