from django.test import TestCase
from django.urls import reverse
from .models import Todo
from django.utils import timezone
import datetime

class TodoModelTest(TestCase):
    def test_create_todo(self):
        todo = Todo.objects.create(title="Test Todo")
        self.assertEqual(todo.title, "Test Todo")
        self.assertFalse(todo.is_resolved)
        self.assertTrue(isinstance(todo.created_at, datetime.datetime))

class TodoViewTest(TestCase):
    def setUp(self):
        self.todo = Todo.objects.create(title="Test Todo")

    def test_todo_list_view(self):
        response = self.client.get(reverse('todo-list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Test Todo")
        self.assertTemplateUsed(response, 'todos/todo_list.html')

    def test_todo_create_view(self):
        response = self.client.post(reverse('todo-create'), {
            'title': 'New Todo',
            'description': 'New Description',
            'due_date': ''
        })
        self.assertEqual(response.status_code, 302) # Redirects after success
        self.assertEqual(Todo.objects.count(), 2)
        self.assertEqual(Todo.objects.last().title, 'New Todo')

    def test_todo_update_view(self):
        response = self.client.post(reverse('todo-update', args=[self.todo.pk]), {
            'title': 'Updated Todo',
            'description': 'Updated Description',
            'is_resolved': True
        })
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Updated Todo')
        self.assertTrue(self.todo.is_resolved)

    def test_todo_delete_view(self):
        response = self.client.post(reverse('todo-delete', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Todo.objects.count(), 0)

    def test_toggle_resolved_view(self):
        response = self.client.get(reverse('todo-resolve', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.is_resolved)
        
        # Toggle back
        response = self.client.get(reverse('todo-resolve', args=[self.todo.pk]))
        self.todo.refresh_from_db()
        self.assertFalse(self.todo.is_resolved)
