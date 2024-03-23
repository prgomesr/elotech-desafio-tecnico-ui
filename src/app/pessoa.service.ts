import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Pageable, Pessoa} from "./model";
import {environment} from "../environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class PessoaService {

  constructor(private http: HttpClient) {
  }

  listar(page?: number, size?: number, nome?: string | null) {
    let params = new HttpParams();
    if (page)
      params = params.append('page', page.toString())
    if (size)
      params = params.append('size', size.toString())
    if (nome)
      params = params.append('nome', nome)
    return this.http.get<Pageable<Pessoa>>(`${environment.API}/v1/pessoas`, {params});
  }

  buscar(id: number) {
    return this.http.get<Pessoa>(`${environment.API}/v1/pessoas/${id}`);
  }

  excluir(id: number) {
    return this.http.delete<void>(`${environment.API}/v1/pessoas/${id}`);
  }

  adicionar(pessoa: Pessoa) {
    return this.http.post<Pessoa>(`${environment.API}/v1/pessoas`, pessoa);
  }

  atualizar(pessoa: Pessoa, id: number) {
    return this.http.put<Pessoa>(`${environment.API}/v1/pessoas/${id}`, pessoa);
  }

}
