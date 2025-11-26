from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.shortcuts import redirect, get_object_or_404
from .models import Todo

class TodoListView(ListView):
    model = Todo
    template_name = 'todos/todo_list.html'
    context_object_name = 'todos'

    def get_queryset(self):
        return Todo.objects.order_by('is_resolved', 'due_date')

class TodoCreateView(CreateView):
    model = Todo
    fields = ['title', 'description', 'due_date']
    template_name = 'todos/todo_form.html'
    success_url = reverse_lazy('todo-list')

class TodoUpdateView(UpdateView):
    model = Todo
    fields = ['title', 'description', 'due_date', 'is_resolved']
    template_name = 'todos/todo_form.html'
    success_url = reverse_lazy('todo-list')

class TodoDeleteView(DeleteView):
    model = Todo
    template_name = 'todos/todo_confirm_delete.html'
    success_url = reverse_lazy('todo-list')

def toggle_resolved(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_resolved = not todo.is_resolved
    todo.save()
    return redirect('todo-list')
