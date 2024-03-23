import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {PessoaService} from "./pessoa.service";
import {debounceTime, distinctUntilChanged, Subject, take, takeUntil} from "rxjs";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {TableModule, TablePageEvent} from "primeng/table";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {InputNumberModule} from "primeng/inputnumber";
import {RadioButtonModule} from "primeng/radiobutton";
import {TagModule} from "primeng/tag";
import {DropdownModule} from "primeng/dropdown";
import {DialogModule} from "primeng/dialog";
import {RatingModule} from "primeng/rating";
import {RippleModule} from "primeng/ripple";
import {Contato, Pessoa} from "./model";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {InputTextModule} from "primeng/inputtext";
import {
  FormBuilder, FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from "@angular/forms";
import {DividerModule} from "primeng/divider";
import {CalendarModule} from "primeng/calendar";
import moment from 'moment';
import {InputMaskModule} from "primeng/inputmask";
import {ErrorMsgComponent} from "./shared/error-msg/error-msg.component";
import {FormValidations} from "./shared/form-validations";
import {ConfirmationService, MessageService} from "primeng/api";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ToolbarModule, TableModule, ConfirmDialogModule, InputNumberModule, RadioButtonModule, TagModule, DropdownModule, DialogModule, RatingModule, RippleModule, CurrencyPipe, InputTextModule, FormsModule, DatePipe, DividerModule, ReactiveFormsModule, CalendarModule, InputMaskModule, ErrorMsgComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'elotech-desafio-tecnico-ui';
  isShowFormPessoa: boolean = false;
  pessoas!: Pessoa[];
  pessoa!: Pessoa;
  totalElementos = 0;
  itensPorPagina = 5;
  indicePagina = 0;
  formPessoa!: FormGroup;
  formContato!: FormGroup;
  isShowFormContato = false;
  contatos: Contato[] = [];
  pessoaId = 0;
  nomeFilter = new FormControl('');
  private $unsub = new Subject();

  constructor(private pessoaService: PessoaService,
              private formBuilder: FormBuilder,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.criaFormPessoa();
    this.criaFormContato();
    this.carregarPessoas();
    this.filtrarPorNome();
  }

  private criaFormContato() {
    this.formContato = this.formBuilder.group({
      id: [],
      nome: ['', Validators.required],
      telefone: ['', [Validators.required, FormValidations.telefoneValidator]],
      email: ['', [Validators.required, FormValidations.emailValidator]]
    });
  }

  private criaFormPessoa() {
    this.formPessoa = this.formBuilder.group({
      id: [],
      nome: ['', [Validators.required]],
      cpf: ['', [Validators.required, FormValidations.documentoValidator]],
      dataNascimento: ['', [Validators.required, FormValidations.dataNascimentoValidator]]
    });
  }

  private carregarPessoas(page?: number, size?: number, nome?: string | null) {
    this.pessoaService.listar(page, size, nome)
      .pipe(
        take(1)
      ).subscribe(value => {
      this.pessoas = value.content;
      this.totalElementos = value.totalElements;
    });
  }

  private buscarPessoa(id: number) {
    this.pessoaService.buscar(id)
      .pipe(
        take(1)
      ).subscribe(p => {
      this.pessoaId = p.id;
      this.pessoa = p;
      this.contatos = p.contatos;
      this.patchForm(p);
    });
  }

  cadastrar() {
    this.isShowFormPessoa = true;
    this.contatos = [];
    this.pessoaId = 0;
    this.criaFormPessoa();
    this.criaFormContato();
  }

  editarPessoa(pessoa: any) {
    this.isShowFormPessoa = true;
    this.buscarPessoa(pessoa.id);
  }

  excluirPessoa(id: number) {
    this.pessoaService.excluir(id)
      .pipe(
        take(1)
      ).subscribe(() => {
      this.messageService.add({severity: 'success', summary: 'Sucesso', detail: 'Registro excluído'});
      this.resetarTabela();
    });
  }

  pageChange(event: TablePageEvent) {
    const first = (event.first as number);
    const rows = (event.rows as number);
    const pagina = first / rows;
    this.indicePagina = pagina;
    this.itensPorPagina = rows;

    this.carregarPessoas(pagina, rows);
  }

  hideDialog(isPessoa: boolean) {
    isPessoa ? this.isShowFormPessoa = false : this.isShowFormContato = false;
  }

  salvarPessoa() {
    if (this.formPessoa.invalid)
      return;

    if (this.contatos.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Adicione ao menos um contato para continuar!'
      });

      return;
    }

    let pessoa = Object.assign({
      id: this.formPessoa.get('id')?.value,
      nome: this.formPessoa.get('nome')?.value,
      cpf: this.formPessoa.get('cpf')?.value,
      dataNascimento: moment(this.formPessoa.get('dataNascimento')?.value, "DD-MM-YYYY").toDate(),
      contatos: this.contatos
    });

    if (this.pessoaId > 0) {
      this.atualizar(pessoa, this.pessoa.id);
    } else {
      this.adicionar(pessoa);
    }
  }

  private adicionar(pessoa: Pessoa) {
    this.pessoaService.adicionar(pessoa)
      .pipe(
        take(1)
      ).subscribe(pessoa => {
      this.atualizarComponentesAposAdicaoDePessoa(pessoa);
    });
  }

  private atualizar(pessoa: Pessoa, id: number) {
    this.pessoaService.atualizar(pessoa, id)
      .pipe(
        take(1)
      ).subscribe(pessoa => {
      this.atualizarComponentesAposAdicaoDePessoa(pessoa);
    });
  }

  private atualizarComponentesAposAdicaoDePessoa(pessoa: Pessoa) {
    this.pessoa = pessoa;
    this.resetarTabela();
    this.messageService.add({severity: 'success', summary: 'Sucesso', detail: 'Registro incluído'});
    this.isShowFormPessoa = false;
    this.isShowFormContato = false;
  }

  private resetarTabela() {
    this.indicePagina = 0;
    this.carregarPessoas(this.indicePagina, this.itensPorPagina);
  }

  private patchForm(pessoa: Pessoa) {
    this.formPessoa.patchValue({
      id: pessoa.id,
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      dataNascimento: moment(pessoa.dataNascimento).format('DD/MM/YYYY').toString()
    });
  }

  excluirContato(index: number) {
    this.contatos.splice(index, 1);
  }

  abrirModalContato() {
    this.isShowFormContato = true;
  }

  adicionarContato() {
    if (this.formContato.invalid)
      return;
    this.contatos.push(this.formContato.value);
    this.formContato.reset();
    this.isShowFormContato = false;
  }

  confirmaExclusao(event: Event, tipo: string, index: number, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Tem certeza que deseja prosseguir?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: "Sim",
      rejectLabel: "Não",
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        tipo === 'contato' ? this.excluirContato(index) : this.excluirPessoa(id);
      }
    })
  }

  getControl(form: UntypedFormGroup, control: string): UntypedFormControl {
    return form.get(control) as UntypedFormControl;
  }

  private filtrarPorNome() {
    this.nomeFilter.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.$unsub)
      ).subscribe(value => {
      this.carregarPessoas(this.indicePagina, this.itensPorPagina, value);
    });
  }

  ngOnDestroy() {
    this.$unsub.next(null);
    this.$unsub.complete();
  }

}
