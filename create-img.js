
const app = Vue.createApp({
    data() {
        return {
            key: "",
            switchState : 0,
            dataBody: {
                prompt: '',
                width: 512,
                height: 512,
                model_id: 1,
            },
            addition: {
                strength: 0.3,
                cfg_scale: 0,
                negative_prompt: '',
                img_fmt: 'png',
            },
           imgfmts : [
            {fmt : "png"},
            {fmt : "jpg"}
           ],
            result: null,

            models: [],
            tasks: []
        }
    },
    mounted() {
        this.getModels()
        var that = this
        this.timer = setInterval(
            that.getTasks, 2000
        )
    },
    methods: {
        showtime() {
            showMessage(location.href)
        },
        update() {
            var myHeaders = new Headers();
            myHeaders.append("ys-api-key", this.key);
            myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");

            var fileInput = document.getElementById('ref_img_file');
            var file = fileInput.files[0];
            var formdata = new FormData();
            formdata.append("ref_img", file);

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: formdata,
                redirect: 'follow'
            };

            fetch("https://ston.6pen.art/release/upload", requestOptions)
                .then(response => response.text())
                .then(result => this.dataBody.ref_img = JSON.parse(result).data.url)
                .catch(error => console.log('error', error))

        },
        downloadImage(url, fileName) {
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;

            // Dispatch a click event on the link to trigger the download
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            link.dispatchEvent(clickEvent);

            // Remove the temporary link element
            document.body.removeChild(link);
        },
        generate() {
            // this.dataBody.model_id = this
            if (this.switchState == 1) {
                this.dataBody.addition = this.addition
            }else{
                this.dataBody.addition = {}
            }
            var config = {
                method: 'post',
                url: 'https://ston.6pen.art/release/open-task',
                headers: {
                    'ys-api-key': this.key,
                    'Content-Type': 'application/json'
                },
                data: this.dataBody
            };
            
            axios(config)
                .then(function (response) {
                    this.result = response.data;
                    showMessage("生成成功，预计耗时" + this.result.data.estimate + "秒")
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        getModels() {

            var config = {
                method: 'get',
                url: 'https://ston.6pen.art/release/open-task/get_models',
                headers: {
                    'ys-api-key': this.key,
                }
            };

            axios(config).then(response => {
                this.models = response.data.results
            })
        },
        getTasks() {
            var that = this;
            axios({
                method: 'get',
                url: 'https://ston.6pen.art/release/open-task?page=1&page_size=999',
                headers: {
                    'ys-api-key': this.key,
                }
            }).then(response => {
                // showMessage("获取成功")
                that.getModels()
                this.tasks = response.data.results
                this.tasks.sort(compareByCreateAt);

            })
        },
        delimg(imageid) {
            var config = {
                method: 'delete',
                url: 'https://ston.6pen.art/release/open-task?id=' + imageid,
                headers: {
                    'ys-api-key': this.key,
                }
            };
            axios(config)
                .then(function (response) {
                    // this.getTasks()
                    showMessage("成功")
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }
})

app.mount('#app')
function showMessage(message) {
    const messageBox = document.getElementById('messageBox');
    messageBox.style.display = 'block';

    const messageText = document.getElementById('messageText');
    messageText.innerText = message;
    setTimeout(hideMessage, 3000)
}

function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.style.display = 'none';
}
// 自定义比较函数，用于将日期字符串转换为日期对象进行比较
function compareByCreateAt(a, b) {
    const dateA = new Date(a.create_at);
    const dateB = new Date(b.create_at);

    // 如果 a 的日期早于 b 的日期，则 a 排在 b 之前
    if (dateA > dateB) {
        return -1;
    }

    // 如果 a 的日期晚于 b 的日期，则 a 排在 b 之后
    if (dateA < dateB) {
        return 1;
    }

    // 如果日期相等，则按照数组原有顺序排序（保持稳定性）
    return 0;
}


// setInterval(getTasks,2000);
