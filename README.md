## Описание

Утилита для перевода [Budibase](https://github.com/akrasnov87/budibase)

Утилита позволяет переводит пакеты, в которых есть файлы с расширением `.svelte` и `.ts`

Работает только для https://github.com/akrasnov87/budibase, если нужно применить для https://github.com/Budibase/budibase, то нужно устанавливать дополнительные пакеты

### Запуск

`node budibase-translate file=[path to file] conf=default`

Команда запуска обработку файла [path to file] с настройками `default`

Чтобы создать настройки нужно в корне проекта создать файл `default.conf`

__Настройки__:
* output_locale - каталог для хранения локалей, по умолчанию он находится в ~/budibase/packages/locales
* output_file - каталог для выходного результата (по умолчанию равен аргументу, указанному в file)
* path_clear - часть пути для относительного отображение наименований настроек

Пример:
<pre>
output_locale="/budibase-translate/temp"
output_file="/budibase-translate/temp"
path_clear="/budibase/packages/"
</pre>

