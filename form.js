window.app = Vue.createApp({
    data() {
        return {
            busy: false,
            data: [{}, {PersonaExpuesta: false, SujetoUIF: false}, {PersonaExpuesta: false, SujetoUIF: false}],
            counts: [undefined, {person: 1,}, {}],
            mins: {person: 1, domicilio: 1, bancos_locales: 1, informacion_patrimonio: 1, actividades_economicas: 1}
        }
    },
    methods: {

        qty: function (key, level) {
            return this.counts[level][key] ? this.counts[level][key] : 0
        },
        add: function (key, level) {
            let curr_cant = this.qty(key, level)
            this.counts[level][key] = curr_cant + 1
        },
        remove: function (key, level) {
            let curr_cant = this.qty(key, level)
            this.counts[level][key] = curr_cant - 1
        },
        show_message: function (key, level) {
            return key in this.counts[level] && this.counts[level][key] == 0;
        },
        validateEmail: function (email) {
            return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        },
        invalidInput(element) {
            let type = element.getAttribute("check-type")
            if (!type) {
                return false
            } else {
                if (type == "DNI") {

                    if (element.value.length < 7) {
                        return "Debe contener al menos 7 caracteres";
                    }

                    if (isNaN(element.value)) {
                        return "Debe ser numerico";
                    }
                }


                if (type == "CUIT") {

                    if (element.value.length != 11) {
                        return "Debe contener 11 caracteres, no ingrese guiones";
                    }

                    if (isNaN(element.value)) {
                        return "Debe ser numerico";
                    }

                }

                if (type == "email") {
                    if (!this.validateEmail(element.value)) {
                        return "Email invalido";
                    }
                }

                if (type == "phone") {
                    if (isNaN(element.value)) {
                        return "Debe ser numerico";
                    }
                }

                if (type == "CBU") {

                    if (isNaN(element.value)) {
                        return "Debe ser numerico";
                    }

                    if (element.value.length != 22) {
                        return "Debe ser 22 digitos";
                    }
                }


                if (type == "inversion") {
                    if (isNaN(element.value)) {
                        return "Debe ser numerico";
                    }

                    if (Number(element.value) < 0 || Number(element.value) > 100) {
                        return "Debe estar entre 0 y 100";
                    }
                }

                if (type == "nacimiento") {


                    if ((new Date().getTime() - new Date(element.value).getTime()) / (1000 * 3600 * 24) / 365 < 18) {
                        return "Debe ser mayor de 18 años";
                    }


                }


            }
        },
        check() {


            let errors = document.querySelectorAll('.error-vue-wp')
            for (let element of errors) {
                element.remove()
            }

            for (let element of this.getInputs()) {
                if (element.required && !String(element.value).trim()) {
                    this.showErrorMessage(element, " Campo requerido")
                    return false;
                }
                let valid = this.invalidInput(element)
                if (typeof valid === "string") {
                    this.showErrorMessage(element, valid)
                    return false;
                }
            }

            for (let personNr = 1; personNr <= this.qty("person", 1); personNr++) {
                for (let key in this.mins) {
                    if (key == "person") {
                        continue
                    }
                    if (this.qty(key, personNr) < this.mins[key]) {
                        this.showErrorMessage(document.getElementById(key + "#" + personNr), "", "afterEnd")
                        this.add(key, personNr)
                        this.remove(key, personNr)
                        return false;
                    }
                }
            }

            return true;

        },
        showErrorMessage(element, message, position = "beforebegin") {
            element.insertAdjacentHTML(position, ` <div class='error-vue-wp'> ${message} &nbsp; </div>`)
            element.parentElement.scrollIntoView({
                block: "center", inline: "center", behavior: 'smooth'
            });
        },
        getInputs() {
            return document.querySelectorAll('input,select')
        },
        getOrder() {
            return [
                {head: "Datos Principales", fields: ["Relacion", "Nombre", "Apellido", "TipoID", "ID"]},
                {head: "Datos fiscales", fields: ["TipoClave", "NumeroTipoClave", "TipoIVA", "TipoGanancias"]},
                {
                    head: "Datos personales",
                    fields: ["FechaNacimiento", "Sexo", "EstadoCivil", "Idioma", "Nacionalidad", "Pais", "PaisOrigen", "LugarNacimiento", "CieAFIP", "Profesion"]
                },
                {head: "Medios de contacto", fields: ["Email", "UsoMail", "Telefono", "UsoTelefono"]},
                {
                    head: "Domicilios", repetable: true, repetable_key: "domicilio",
                    fields: ["Uso", "Barrio", "Calle", "Nro", "Torre", "Piso", "Departamento", "Lugar", "CodigoPostal", "Notas"]
                },
                {
                    head: "Cuenta bancaria local", repetable: true, repetable_key: "bancos_locales",
                    fields: ["TipoID", "CVU", "Alias", "TipoCuenta", "Moneda", "NumeroBco", "Titularidad"]
                },
                {
                    head: "Patrimonio", repetable: true, repetable_key: "informacion_patrimonio",
                    fields: ["FechaPatrimonio", "Patrimonio", "Ingresos", "DestinadoInversion", "OrigenFondos", "TransferPesos", "TransferUsd", "Cheques", "ChequesTros", "PzoFijo", "Otros"]
                },
                {
                    head: "Actividades económicas", repetable: true, repetable_key: "actividades_economicas",
                    fields: ["TipoActividad", "Rubro", "Antiguedad", "Empresa", "Puesto", "DescripcionPuesto"]
                },
                {
                    head: "Declaraciones",
                    fields: ["PersonaExpuesta", "SujetoUIF"]
                }
            ]
        },
        reset() {
            this.data = [{}, {}, {}]
            this.counts = [undefined, {person: 1}, {}]
        },
        print() {

            if (this.busy) {
                return;
            }
            this.busy = true;
            try {
                let res = this.check();
                if (!res) {
                    return
                }
                let order = this.getOrder()
                let text = []
                for (let personNr = 1; personNr <= this.qty("person", 1); personNr++) {
                    console.log(personNr, "PNR")
                    for (let key of order) {
                        if (key.repetable) {
                            for (let ent = 1; ent <= this.qty(key.repetable_key, personNr); ent++) {
                                text.push(` ---------${key.head} #${ent} ---------`)
                                for (let field of key.fields) {
                                    let label_key = field + "#" + ent + "#" + personNr
                                    let value_key = field + "#" + ent
                                    if (typeof this.data[personNr][value_key] != "undefined") {
                                        let label = document.querySelectorAll(`label[for="${label_key}"]`)[0].innerText;
                                        let value = this.data[personNr][value_key]
                                        if (value === true) {
                                            value = "Si"
                                        }
                                        if (value === false) {
                                            value = "No"
                                        }
                                        text.push(`${label} : ${value}`)
                                    }
                                }
                            }
                        } else {
                            text.push(`---------${key.head}----------`)
                            for (let field of key.fields) {
                                if (typeof this.data[personNr][field] != "undefined") {
                                    let id_key = field + "#" + personNr
                                    let label = document.querySelectorAll(`label[for="${id_key}"]`)[0].innerText;
                                    let value = this.data[personNr][field]
                                    if (value === true) {
                                        value = "Si"
                                    }
                                    if (value === false) {
                                        value = "No"
                                    }
                                    text.push(`${label} : ${value}`)
                                }
                            }
                        }
                    }
                }

                let data = new FormData()
                let files = this.getFiles()
                data.append('mail', text.join("\n"))

                console.log(text)

                for (let element of files) {
                    data.append(element.getAttribute("id"), element.files[0])
                }

                let self = this;
                fetch('http://ugvalores.com.ar/wp-json/ndx/v1/my-endpoint', {
                    method: 'POST',
                    body: data,
                })
                    .catch(x => {
                        self.busy = false;
                        alert("(Cod. 50) No pudimos procesar su solicitud en este momento, intente mas tarde")
                    })
                    .then(response => {
                            alert("Su formulario fue enviado");
                            app.reset()
                            self.busy = false;
                        }
                    )

            } catch (e) {
                alert("(Cod. 55) No pudimos procesar su solicitud en este momento, intente mas tarde")
                self.busy = false;
            }
        },

        getFiles() {

            return document.querySelectorAll('input[type="file"]')

        }


    }
}).mount('#form-app-wp')