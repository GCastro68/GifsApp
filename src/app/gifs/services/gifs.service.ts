import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { SearchGifsResponse, Gif } from '../interface/gifs.interface';

@Injectable({
  providedIn: 'root',
})
export class GifsService {
  //En manual de Evernote explico como se obtiene APIKey
  private apiKey: string = '0jrRGAKzoGo2Z136efm7TLkOGUiRYMY2';
  private servicioUrl: string = 'https://api.giphy.com/v1/gifs';

  //se pone como _historial para poder exponer alguna propiedad
  //para obtener el historial que en tiempo real se esté cambiando
  private _historial: string[] = [];

  //Se usa para el almacenado de los resultados al consultar las imágenes
  public resultados: Gif[] = [];

  get historial() {
    // Se retorna [...this._historial] para romper la relación ya que se se
    // modifica get historial() es posible que se afecte al arreglo original
    // A los ... se le llama operador spread
    return [...this._historial];
  }
  // Servicio que se usa para hacer las peticiones http
  constructor(private http: HttpClient) {
    if (localStorage.getItem('historial')) {
      //Al final pongo el signo ! para decirle a Angular que ya validé
      //que no se cargue valor nulo y evitar que marque error
      //historial de búsquedas que se muestra en la columna de la izquierda
      this._historial = JSON.parse(localStorage.getItem('historial')!);
    }

    //Esta línea hace lo mismo que la condición anterior pero en una sola línea
    //pero para los resultados (imágenes que se han desplegado)
    //se hace esto para desplegar las imágenes que ya se han desplegado al
    //hacer un refresh a la página
    this.resultados = JSON.parse(localStorage.getItem('resultados')!) || [];
  }

  //Para insertar valores al nuevo historial
  //se usa unshift para inserta el elemento al principio del arreglo
  buscarGifs(query: string = '') {
    //Validar que todo se grabe sin espacio y en minúsculas
    query = query.trim().toLocaleLowerCase();

    if (!this._historial.includes(query)) {
      //Si el elemento a agregar no existe se agrega
      this._historial.unshift(query);

      //Inserto elemento y valido si son mas de 10 elementos
      //Va a estar cortando el arreglo para mentener 10 elementos
      this._historial = this._historial.splice(0, 10);

      //Guardo en localstorage
      localStorage.setItem('historial', JSON.stringify(this._historial));
    }

    // HttpParams es de Angula y sirve para no poner toda la url con los parámetros sino que en una variable definir los parámetros
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('limit', '10')
      .set('q', query);

    // Se hace el llamado al servicio de giphy por medio del
    //módulo de Angular para el manejo de servicios.
    //El servicio de Angular regresa observables que tienen mas funcionalidades
    //que usar el fetch de Javascript

    //{params:params}  =   {params}   así es como se deja
    this.http
      .get<SearchGifsResponse>(`${this.servicioUrl}/search`, { params })
      .subscribe((resp) => {
        //Se pone resp:any para que no marque error al poner resp.data
        this.resultados = resp.data;

        //Se va guardando lo desplegado para que al cargar de nuevo la página
        // desplegar lo que se había desplegado
        localStorage.setItem('resultados', JSON.stringify(this.resultados));
      });
  }
}
