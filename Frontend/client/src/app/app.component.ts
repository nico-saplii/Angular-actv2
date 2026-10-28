import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  searchTerm: string = '';

  currentTicket: Ticket = {
    asunto: '',
    solicitante: '',
    descripcion: '',
    categoria: 'Soporte Técnico',
    prioridad: 'Media',
    estado: 'Abierto',
    fechaRegistro: new Date().toISOString().split('T')[0]
  };

  isEditing: boolean = false;
  editId: number | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.filteredTickets = data;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'No se pudo conectar con el servidor backend.';
      }
    });
  }

  filterTickets(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredTickets = this.tickets;
    } else {
      this.filteredTickets = this.tickets.filter(t =>
        t.asunto.toLowerCase().includes(term) ||
        t.solicitante.toLowerCase().includes(term)
      );
    }
  }

  saveTicket(): void {
    if (!this.currentTicket.asunto || !this.currentTicket.solicitante || !this.currentTicket.descripcion) {
      this.errorMessage = 'Por favor complete los campos requeridos.';
      return;
    }

    if (this.isEditing && this.editId !== null) {
      this.ticketService.updateTicket(this.editId, this.currentTicket).subscribe({
        next: () => {
          this.successMessage = 'Ticket actualizado exitosamente.';
          this.resetForm();
          this.loadTickets();
        },
        error: () => { this.errorMessage = 'Error al actualizar el ticket.'; }
      });
    } else {
      this.currentTicket.fechaRegistro = new Date().toISOString().split('T')[0];
      this.ticketService.createTicket(this.currentTicket).subscribe({
        next: () => {
          this.successMessage = 'Ticket creado exitosamente.';
          this.resetForm();
          this.loadTickets();
        },
        error: () => { this.errorMessage = 'Error al guardar el ticket.'; }
      });
    }
  }

  editTicket(ticket: Ticket): void {
    this.isEditing = true;
    this.editId = ticket.id ?? null;
    this.currentTicket = { ...ticket };
  }

  deleteTicket(id?: number): void {
    if (!id) return;
    if (confirm('¿Desea eliminar esta solicitud?')) {
      this.ticketService.deleteTicket(id).subscribe({
        next: () => {
          this.successMessage = 'Ticket eliminado con éxito.';
          this.loadTickets();
        },
        error: () => { this.errorMessage = 'Error al eliminar el ticket.'; }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editId = null;
    this.currentTicket = {
      asunto: '',
      solicitante: '',
      descripcion: '',
      categoria: 'Soporte Técnico',
      prioridad: 'Media',
      estado: 'Abierto',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
  }
}