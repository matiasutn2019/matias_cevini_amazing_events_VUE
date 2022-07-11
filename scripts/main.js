const app = Vue.createApp({
    data() {
        return {
            eventos: [],
            fechaActual: '',
            eventosPasados: [],
            eventosFuturos: [],
            eventoDetalles: [],
            id: '',
            nombreEvento: '',
            categorias: [],
            categoriasSeleccionadas: [],
            eventosFiltrados: [],
            eventosEstadisticas: [],
            eventosFuturosEstadisticas: [],
            eventosPasadosEstadisticas: [],
            eventosFiltradosPorFecha: []
        }
    },
    created() {
        fetch('https://amazing-events.herokuapp.com/api/events')
            .then(response => response.json())
            .then(data => {
                this.eventos = data.events;
                this.fechaActual = data.currentDate;
                this.eventosFiltrados = this.eventos;
                this.obtenerCategorias(this.eventosFiltrados)
            })
    },

    methods: {
        filtrarInput(eventos) {
            this.eventosFiltrados = eventos.filter(evento => // hay q sacar el this a eventos para q use eventos del parámetro
                evento.name.toLowerCase().includes(this.nombreEvento.toLowerCase()));
        },

        obtenerCategorias(eventos) {
            eventos.forEach(categoria => {
                if (!this.categorias.includes(categoria.category)) {
                    this.categorias.push(categoria.category)
                }
            })
        },

        mayorPorcentajeAsistencia() {
            let nombre = '';
            let numero = 0
            this.eventosFiltrados.forEach(evento => {
                let asistencia = parseInt(evento.assistance)
                let capacidad = parseInt(evento.capacity)
                let porcentaje = asistencia * 100 / capacidad
                if (porcentaje > numero) {
                    numero = porcentaje
                    nombre = evento.name
                }
            })
            this.eventosEstadisticas[0] = nombre
        },

        menorPorcentajeAsistencia() {
            let nombre = '';
            let numero = 99999999
            this.eventosFiltrados.forEach(evento => {
                let asistencia = parseInt(evento.assistance)
                let capacidad = parseInt(evento.capacity)
                let porcentaje = asistencia * 100 / capacidad
                if (porcentaje < numero) {
                    numero = porcentaje
                    nombre = evento.name
                }
            })
            this.eventosEstadisticas[1] = nombre
        },

        mayorCapacidad() {
            let nombre = '';
            let numero = 0
            this.eventosFiltrados.forEach(evento => {
                if (parseInt(evento.capacity) > numero) {
                    numero = parseInt(evento.capacity)
                    nombre = evento.name
                }
            })
            this.eventosEstadisticas[2] = nombre
        },

        statsByCategory(eventos) {
            let array = []
            let i = 1
            let j
            this.categorias.forEach(categoria => {
                let revenues = 0
                let porcentajeAsistenciaCadaEvento = 0
                let porcentajeAsistenciaPorCategoria = 0
                j = 0
                eventos.forEach(evento => {
                    if (evento.estimate != null) { // eventos futuros
                        if (evento.category == categoria) {
                            j++
                            revenues += evento.estimate * evento.price
                            porcentajeAsistenciaCadaEvento += evento.estimate * 100 / evento.capacity
                        }
                    } else if (evento.assistance != null) { // eventos pasados
                        if (evento.category == categoria) {
                            j++
                            revenues += evento.assistance * evento.price
                            porcentajeAsistenciaCadaEvento += evento.assistance * 100 / evento.capacity
                        }
                    }
                })
                if (j != 0) {
                    porcentajeAsistenciaPorCategoria = (porcentajeAsistenciaCadaEvento / j).toFixed(2)
                    i++
                    array.push([categoria, '$ ' + revenues, porcentajeAsistenciaPorCategoria + ' %'])
                } else {
                    array.push([categoria, 0, 0])
                }

            })
            return array
        },

        statsEventosFuturos() {
            let eventosFiltrados = this.eventosFiltrados.filter(x => x.date > this.fechaActual)
            this.eventosFuturosEstadisticas = this.statsByCategory(eventosFiltrados)
        },

        statsEventosPasados() {
            let eventosFiltrados = this.eventosFiltrados.filter(x => x.date < this.fechaActual)
            this.eventosPasadosEstadisticas = this.statsByCategory(eventosFiltrados)
        }
    },

    computed: {
        buscarId() {
            const urlParams = new URLSearchParams(window.location.search);
            this.id = urlParams.get("id");
            this.eventoDetalles = this.eventos.filter(evento => evento._id == this.id);
        },

        buscador() {
            if (window.location.href.includes('past')) {
                this.eventosFiltradosPorFecha = this.eventos.filter(x => x.date < this.fechaActual)
            } else if (window.location.href.includes('upcoming')) {
                this.eventosFiltradosPorFecha = this.eventos.filter(x => x.date > this.fechaActual)
            } else {
                this.eventosFiltradosPorFecha = this.eventos
            }

            if (this.categoriasSeleccionadas.length != 0) {
                this.eventosFiltrados = this.eventosFiltradosPorFecha.filter(evento => {
                    return this.categoriasSeleccionadas.includes(evento.category)
                })
            } else {
                this.eventosFiltrados = this.eventosFiltradosPorFecha
            }

            if (this.nombreEvento != '') {
                this.filtrarInput(this.eventosFiltrados)
            }
        },

        estadisticas() {
            this.mayorPorcentajeAsistencia()
            this.menorPorcentajeAsistencia()
            this.mayorCapacidad()
            this.statsEventosFuturos()
            this.statsEventosPasados()
        }
    }
}).mount('#app')